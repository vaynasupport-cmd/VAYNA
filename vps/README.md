# VAYNA MT5 Sync Script — Guide d'installation

## Prérequis

- **Windows 10/11** ou **Windows Server** (MetaTrader 5 ne fonctionne que sur Windows)
- **Python 3.10+** installé ([python.org](https://www.python.org/downloads/))
- **MetaTrader 5** installé et connecté à au moins un broker

## Installation

### 1. Installer Python et les dépendances

```bash
# Vérifier que Python est installé
python --version

# Installer les dépendances
cd vps
pip install -r requirements.txt
```

### 2. Configurer les variables d'environnement

Copiez le fichier `.env.example` en `.env` et remplissez-le :

```bash
cp .env.example .env
```

Éditez le fichier `.env` :
```
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **IMPORTANT** : Utilisez la **Service Role Key** (pas l'anon key).
> Trouvez-la dans : Supabase Dashboard → Settings → API → `service_role` (secret)

### 3. Préparer MetaTrader 5

1. Ouvrez MetaTrader 5
2. Connectez-vous à votre broker
3. Allez dans **Outils → Options → Expert Advisors**
4. Cochez ✅ **Autoriser le trading algorithmique**
5. Laissez MT5 ouvert en arrière-plan

### 4. Lancer le script

```bash
cd vps
python sync_trades.py
```

Vous devriez voir :
```
════════════════════════════════════════════════════════
  VAYNA MT5 Sync — Démarrage
════════════════════════════════════════════════════════
🆕 Nouveau compte détecté: 51234567 (ICMarkets-Live05)
[51234567] ✅ Connecté — Balance: 10000.00 USD
📜 Synchronisation de l'historique (90 jours)...
   42 fermetures trouvées. Insertion en cours...
   ✅ 42 trades historiques synchronisés.
[51234567] 📊 3 positions ouvertes détectées
📡 1 workers actifs | Prochaine vérification dans 30s
```

## Fonctionnement

1. Le script lit la table `mt5_accounts` dans Supabase
2. Pour chaque compte actif, il crée un **thread** dédié
3. Chaque thread se connecte à MT5 avec le **mot de passe investisseur** (lecture seule)
4. Il surveille les positions ouvertes **toutes les 5 secondes**
5. Quand une position se ferme → le trade est inséré dans Supabase
6. **VAYNA reçoit le trade instantanément** via Supabase Realtime

## Lancer en arrière-plan (VPS)

### Option 1 : Planificateur de tâches Windows
1. Ouvrez le **Planificateur de tâches** (Task Scheduler)
2. Créez une tâche basique → Démarrage de l'ordinateur
3. Action : `python C:\chemin\vers\vps\sync_trades.py`

### Option 2 : NSSM (Non-Sucking Service Manager)
```bash
# Installer NSSM
choco install nssm

# Créer un service Windows
nssm install VAYNA-MT5-Sync "C:\Python310\python.exe" "C:\chemin\vers\vps\sync_trades.py"
nssm start VAYNA-MT5-Sync
```

## Dépannage

| Problème | Solution |
|----------|----------|
| `MetaTrader5 n'est pas installé` | Installez MT5 depuis [metatrader5.com](https://www.metatrader5.com/) |
| `Connexion refusée` | Vérifiez le login, le mot de passe investisseur et le serveur broker |
| `Aucun compte MT5 actif` | L'utilisateur doit d'abord connecter son compte dans VAYNA → Paramètres → MT5 Sync |
| `Erreur Supabase` | Vérifiez que la `SUPABASE_SERVICE_KEY` est correcte et que la table `mt5_accounts` existe |

## Sécurité

- Le script utilise le **mot de passe investisseur** (lecture seule) — aucun trade ne peut être exécuté
- La **Service Key Supabase** ne doit JAMAIS être partagée ou commitée dans Git
- Ajoutez `vps/.env` dans votre `.gitignore`
