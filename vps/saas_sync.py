"""
VAYNA MT5 SaaS Orchestrator - Multi-User Polling Version
Syncs trades from MetaTrader 5 to Supabase for MULTIPLE users sequentially.
"""
import os
import sys
import time
import logging
import requests
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("ERREUR: Definissez SUPABASE_URL et SUPABASE_SERVICE_KEY dans .env")
    sys.exit(1)

try:
    import MetaTrader5 as mt5
except ImportError:
    print("ERREUR: pip install MetaTrader5")
    sys.exit(1)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
logger = logging.getLogger("VAYNA-SAAS")

HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

# --- LOCAL MEMORY (Never re-import deleted trades) ---
HISTORY_FILE = "saas_synced_tickets.json"
import json
SAAS_MEMORY = {}

def load_history():
    global SAAS_MEMORY
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r") as f:
                SAAS_MEMORY = json.load(f)
            logger.info("Local ticket memory loaded.")
        except Exception as e:
            logger.warning(f"Could not load history file: {e}")

def flush_memory_to_disk():
    try:
        with open(HISTORY_FILE, "w") as f:
            json.dump(SAAS_MEMORY, f)
    except Exception as e:
        logger.warning(f"Could not save to history file: {e}")

def save_ticket_to_memory(user_id, ticket):
    global SAAS_MEMORY
    if user_id not in SAAS_MEMORY:
        SAAS_MEMORY[user_id] = []
    
    if ticket not in SAAS_MEMORY[user_id]:
        SAAS_MEMORY[user_id].append(ticket)

def is_ticket_synced(user_id, ticket):
    """Vérifie si le ticket a DEJA été importé un jour (même s'il a été supprimé de la BDD)"""
    if user_id in SAAS_MEMORY and ticket in SAAS_MEMORY[user_id]:
        return True
    return False


def get_active_mt5_accounts():
    try:
        # Join avec la table accounts pour récupérer le capital initial (pour calcul R:R)
        url = f"{SUPABASE_URL}/rest/v1/mt5_accounts?is_active=eq.true&select=*,accounts!mt5_accounts_account_id_fkey(initial_capital)"
        resp = requests.get(url, headers=HEADERS)
        resp.raise_for_status()
        results = resp.json()
        # Extraire initial_capital du join et l'aplatir
        for acc in results:
            acc_data = acc.pop('accounts', None)
            acc['initial_capital'] = acc_data.get('initial_capital', 0) if acc_data else 0
        return results
    except Exception as e:
        logger.error(f"DB error (get_accounts): {e}")
        return []

def update_last_sync(mt5_account_id):
    try:
        url = f"{SUPABASE_URL}/rest/v1/mt5_accounts?id=eq.{mt5_account_id}"
        payload = {"last_sync_at": datetime.now(timezone.utc).isoformat()}
        requests.patch(url, headers=HEADERS, json=payload)
    except Exception as e:
        logger.warning(f"Cannot update last_sync_at: {e}")

def deactivate_mt5_account(mt5_account_id, reason):
    try:
        url = f"{SUPABASE_URL}/rest/v1/mt5_accounts?id=eq.{mt5_account_id}"
        payload = {"is_active": False}
        requests.patch(url, headers=HEADERS, json=payload)
        logger.warning(f"  [X] Compte MT5 desactive dans Supabase. Raison: {reason}")
    except Exception as e:
        logger.error(f"Cannot deactivate account: {e}")

def upsert_trade(trade_data):
    url = f"{SUPABASE_URL}/rest/v1/trades?on_conflict=user_id,ticket"
    upsert_headers = {**HEADERS, "Prefer": "resolution=merge-duplicates,return=representation"}
    try:
        resp = requests.post(url, headers=upsert_headers, json=trade_data, timeout=15)
        if resp.status_code not in [200, 201]:
            logger.error(f"DB upsert failed ({resp.status_code}): {resp.text[:200]}")
            return False
        return True
    except Exception as e:
        logger.error(f"Network error during DB upsert: {e}")
        return False

def map_deal_to_trade(exit_deal, entry_deal, user_id, account_id, account_balance=0):
    if entry_deal:
        direction = "BUY" if entry_deal.type == mt5.DEAL_TYPE_BUY else "SELL"
        entry_price = entry_deal.price
        entry_time = datetime.fromtimestamp(entry_deal.time, tz=timezone.utc).isoformat()
        deal_date = datetime.fromtimestamp(entry_deal.time, tz=timezone.utc).strftime("%Y-%m-%d")
        commission = round(exit_deal.commission + entry_deal.commission, 2)
        swap = round(exit_deal.swap + entry_deal.swap, 2)
    else:
        direction = "SELL" if exit_deal.type == mt5.DEAL_TYPE_BUY else "BUY"
        entry_price = exit_deal.price
        entry_time = datetime.fromtimestamp(exit_deal.time, tz=timezone.utc).isoformat()
        deal_date = datetime.fromtimestamp(exit_deal.time, tz=timezone.utc).strftime("%Y-%m-%d")
        commission = round(exit_deal.commission, 2) if exit_deal.commission else 0
        swap = round(exit_deal.swap, 2) if exit_deal.swap else 0

    profit = exit_deal.profit + swap + commission
    
    if profit > 0: result = "GAIN"
    elif profit < 0: result = "PERTE"
    else: result = "BE"

    # ── Calcul R:R basé sur la taille du compte ──
    # 1R = 1% du solde du compte (standard prop firm)
    risk_percent = 1.0  # Par défaut 1%
    pnl_percent = 0.0
    r_multiple = None

    if account_balance > 0:
        one_r = account_balance * 0.01  # 1R = 1% du solde
        pnl_percent = round((profit / account_balance) * 100, 4)
        r_multiple = round(profit / one_r, 2) if one_r > 0 else None
    
    return {
        "user_id": user_id,
        "account_id": account_id,
        "date": deal_date,
        "created_date_time": entry_time,
        "asset": exit_deal.symbol,
        "timeframe": "Auto",
        "direction": direction,
        "risk_percent": risk_percent,
        "entry_price": entry_price,
        "exit_price": exit_deal.price,
        "position_size": exit_deal.volume,
        "result": result,
        "pnl_amount": round(profit, 2),
        "pnl_percent": pnl_percent,
        "r_multiple": r_multiple,
        "commission": commission,
        "swap": swap,
        "comment": f"SaaS Sync - {exit_deal.ticket}",
        "ticket": exit_deal.ticket,
        "source": "mt5_sync",
    }

def sync_account(acc):
    login = int(acc['login'])
    password = acc['investor_password']
    server = acc['broker_server']
    user_id = acc['user_id']
    account_id = acc['account_id']
    mt5_account_id = acc['id']
    
    logger.info(f"--- Checking Account: {login} @ {server} ---")
    
    if not mt5.login(login=login, password=password, server=server):
        err = mt5.last_error()
        logger.error(f"  [!] MT5 login failed: {err}")
        # Auto-Recovery for IPC send failed (-10001) or terminal crash
        if err and err[0] == -10001:
            logger.warning("  [!] IPC connection broken (MT5 crashed/closed). Attempting Auto-Recovery...")
            mt5.shutdown()
            time.sleep(3)
            if mt5.initialize():
                logger.info("  [+] MT5 successfully restarted and connected!")
            else:
                logger.error("  [!] FATAL: Could not restart MT5.")
        else:
            # Si le mot de passe est faux ou serveur invalide, on desactive le compte
            # pour eviter que le broker bloque l'IP du VPS pour "trop de tentatives"
            logger.error("  [!] Erreur de login fatale. Desactivation automatique du compte client.")
            deactivate_mt5_account(mt5_account_id, str(err))
        return
        
    info = mt5.account_info()
    if info is None:
        err = mt5.last_error()
        logger.error(f"  [!] Failed to get account info: {err}")
        if err and err[0] == -10001:
            mt5.shutdown()
            time.sleep(3)
            mt5.initialize()
        return
        
    last_sync_str = acc.get('last_sync_at')
    
    if last_sync_str:
        try:
            # Parse last_sync_at (UTC) to local naive datetime for MT5
            dt_utc = datetime.fromisoformat(last_sync_str.replace("Z", "+00:00"))
            dt_local = dt_utc.astimezone()
            # 5 minutes margin to avoid missing trades on border, but prevents 3-days re-import
            from_date = dt_local.replace(tzinfo=None) - timedelta(minutes=5)
        except Exception:
            from_date = datetime.now() - timedelta(minutes=5)
    else:
        # First connection: we only look forward from now (or slightly before to catch the immediate past)
        from_date = datetime.now() - timedelta(minutes=5)
        
    to_date = datetime.now() + timedelta(days=1)
    
    deals = mt5.history_deals_get(from_date, to_date)
    if not deals:
        logger.info("  Aucun trade trouvé récemment.")
        update_last_sync(mt5_account_id)
        return
        
    closed = [d for d in deals if d.entry == mt5.DEAL_ENTRY_OUT and d.symbol != ""]
    if not closed:
        logger.info("  Aucun trade FERME trouvé récemment.")
        update_last_sync(mt5_account_id)
        return
    
    inserted = 0
    for exit_deal in closed:
        # On vérifie dans la mémoire locale si on a DEJA importé ce ticket un jour.
        if is_ticket_synced(user_id, exit_deal.ticket):
            continue
            
        entry_deal = next((d for d in deals if d.position_id == exit_deal.position_id and d.entry == mt5.DEAL_ENTRY_IN), None)
        # Utiliser le capital initial (fixe) pour le calcul R:R, pas le solde actuel
        initial_capital = acc.get('initial_capital', 0) or info.balance
        trade_data = map_deal_to_trade(exit_deal, entry_deal, user_id, account_id, initial_capital)
        
        if upsert_trade(trade_data):
            logger.info(f"  -> NOUVEAU TRADE SYNC: {exit_deal.symbol} (Ticket: {exit_deal.ticket}) | PnL: {trade_data['pnl_amount']}")
            save_ticket_to_memory(user_id, exit_deal.ticket)
            inserted += 1
            
    if inserted > 0:
        logger.info(f"  => {inserted} nouveaux trades ajoutés pour l'utilisateur !")
        flush_memory_to_disk()
    else:
        logger.info("  => A jour. (0 nouveau trade)")
        
    update_last_sync(mt5_account_id)

def main():
    logger.info("=========================================")
    logger.info("VAYNA SaaS Orchestrator - Started")
    logger.info("=========================================")
    
    load_history()
    
    if not mt5.initialize():
        logger.error(f"MT5 initialize failed: {mt5.last_error()}")
        sys.exit(1)
        
    logger.info(f"MT5 initialized: {mt5.version()}")
    
    try:
        while True:
            try:
                accounts = get_active_mt5_accounts()
                if not accounts:
                    logger.info("Aucun compte MT5 actif dans la BDD. Pause de 30s...")
                    time.sleep(30)
                    continue
                    
                logger.info(f"Début de la boucle pour {len(accounts)} compte(s)...")
                for acc in accounts:
                    try:
                        sync_account(acc)
                    except Exception as e:
                        logger.error(f"Unexpected error syncing account {acc.get('login')}: {e}")
                    time.sleep(1) # Petite pause pour ne pas surcharger MT5/le Broker
                    
                logger.info("Boucle terminée. Pause de 10 secondes avant le prochain cycle...")
                time.sleep(10)
            except Exception as e:
                logger.error(f"Critical error in main loop: {e}")
                time.sleep(10)
            
    except KeyboardInterrupt:
        logger.info("Arrêt manuel de l'Orchestrateur...")
    finally:
        mt5.shutdown()
        logger.info("MT5 éteint.")

if __name__ == "__main__":
    main()
