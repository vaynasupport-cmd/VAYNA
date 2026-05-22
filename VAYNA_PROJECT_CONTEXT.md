# 🧠 VAYNA - Contexte & Architecture du Projet

> **Note pour l'IA** : Ce fichier est la référence absolue pour comprendre le projet VAYNA. Lorsque l'utilisateur demande de "lire le contexte", réfère-toi à ce document pour comprendre instantanément la stack, l'architecture, le design et les fonctionnalités du projet.

## 🎯 1. Description Générale
**VAYNA** est une application SaaS de Journal de Trading Professionnel, conçue pour offrir une expérience utilisateur haut de gamme (premium), similaire à des outils comme Notion, Linear ou TradingView. Elle permet aux traders (particuliers ou prop firms) de suivre leurs performances, d'analyser leurs trades, et de tenir un journal psychologique.

**L'application est hybride :**
- Elle fonctionne comme une application Web classique (SaaS).
- Elle peut être packagée en application Desktop native Windows grâce à **Electron**.
- Elle propose une **Synchronisation Automatique avec MetaTrader 5 (MT5)** via un serveur Python (souvent hébergé sur un VPS).

---

## 🛠️ 2. Stack Technique Globale

### 🎨 Frontend (UI / UX)
- **Framework Core** : React 18, TypeScript, Vite.js.
- **Routing** : React Router DOM v6.
- **State Management** : Zustand (pour les stores globaux : accounts, trades, journal_entries, etc.).
- **Styling** : Tailwind CSS (avec `tailwind-merge`, `clsx`, `cva`).
- **UI Components** : shadcn/ui (basé sur Radix UI primitives).
- **Animations** : Framer Motion (micro-interactions, transitions fluides).
- **Graphiques** : Recharts (courbes d'équité, bar charts de performance).
- **Icônes** : Lucide React.
- **Design System** : Mode sombre prédominant, UI minimaliste, composants "glassmorphism", bordures subtiles, typographie soignée.

### 🗄️ Backend & Base de données
- **BaaS (Backend as a Service)** : **Supabase**.
- **Base de données** : PostgreSQL.
- **Sécurité** : Authentification Supabase, avec des Row Level Security (RLS) strictes pour isoler les données de chaque utilisateur (`user_id = auth.uid()`).
- **Temps Réel** : Supabase Realtime (utilisé pour mettre à jour instantanément le dashboard quand un nouveau trade MT5 est synchronisé).

### 🤖 MT5 Sync Server (Serveur Python / VPS)
- **Langage** : Python 3.10+.
- **Rôle** : Scripts (`vps/saas_sync.py`, `vps/sync_trades.py`) qui se connectent à l'API MetaTrader 5 locale (en utilisant les mots de passe investisseur / lecture seule).
- **Fonctionnement** : Lit les positions fermées et les envoie directement dans la table `trades` de Supabase via l'API (avec la Service Role Key).
- Le frontend écoute ensuite ces changements via un hook `useAutoImport`.

### 🖥️ Desktop Wrapper
- **Technologie** : Electron, electron-builder.
- **Communication** : IPC (Inter-Process Communication) via le dossier `/electron`.

---

## 📂 3. Structure du Projet

```text
trading-journal-app/
├── 📁 electron/          # Code spécifique à l'app Desktop (main.ts, preload.ts)
├── 📁 src/               # Code source principal React
│   ├── 📁 components/    # Composants réutilisables et composants shadcn/ui
│   ├── 📁 contexts/      # Contextes React (AuthContext)
│   ├── 📁 hooks/         # Hooks personnalisés (useDatabase, useStore, useAuth, useAutoImport)
│   ├── 📁 lib/           # Utilitaires (statsCalculator.ts, supabaseClient.ts)
│   ├── 📁 pages/         # Pages complètes (Dashboard, Trades, Accounts, etc.)
│   ├── 📁 styles/        # CSS globaux (index.css, variables Tailwind)
│   └── 📁 types/         # Types et Interfaces TypeScript globaux
├── 📁 supabase/          # Fichiers de migration SQL pour init la DB
│   └── 📁 migrations/    # Scripts SQL (setup_database.sql, mt5_accounts_migration.sql)
├── 📁 vps/               # Serveur de synchronisation MT5 (Scripts Python)
│   ├── saas_sync.py      # Script principal SaaS pour la synchronisation
│   ├── sync_trades.py    # Script local de synchronisation
│   ├── diag.py           # Script de diagnostic
│   └── README.md         # Documentation pour installer le script Python sur un VPS
├── 📄 package.json       # Dépendances Node.js (Vite, React, Tailwind, Supabase)
├── 📄 tailwind.config.js # Configuration Tailwind (animations, couleurs personnalisées)
└── 📄 vite.config.ts     # Configuration du bundler Vite
```

---

## 🗃️ 4. Schéma de Base de Données (Supabase)

1. **`accounts`** : Gère les comptes de trading (Prop firm ou personnels).
   - *Champs clés* : `user_id`, `name`, `initial_capital`, `current_capital`, `max_drawdown_amount`, `target_amount`, `status` (active, validated, lost).
2. **`trades`** : Historique des transactions de trading.
   - *Champs clés* : `account_id`, `date`, `asset`, `direction` (Buy/Sell), `entry_price`, `exit_price`, `pnl_amount`, `result` (Win/Loss/Break-even), `setup_type`, `emotional_tag`, `ticket` (pour MT5).
3. **`journal_entries`** : Notes personnelles du trader (aspect psychologique).
   - *Champs clés* : `date`, `content`, `mental_state`, `discipline_score`, `focus_score`.
4. **`screenshots`** : Images associées aux trades.
5. **`mt5_accounts`** : Gère les identifiants pour que le serveur Python puisse se connecter au compte MT5 de l'utilisateur.

---

## 🌟 5. Fonctionnalités Principales (Pages)

1. **Pages Publiques** : Landing Page (`/`), Login (`/login`), Register (`/register`), FAQ, Features. Design marketing très soigné.
2. **Dashboard (`/app/dashboard`)** : Vue d'ensemble avec courbe d'équité (Equity Curve) calculée dynamiquement, statistiques clés (P&L total, Winrate, Profit Factor).
3. **Accounts (`/app/accounts`)** : Gestion multi-comptes. Calcule automatiquement si un compte a touché son Drawdown (statut "lost") ou son objectif (statut "validated").
4. **Trades (`/app/trades`)** : Tableau complet des trades avec filtres, édition inline, ajout de commentaires, de setup types, et d'images.
5. **Statistics (`/app/statistics`)** : Tableaux de bord avancés (Winrate par jour, Performance par Setup, Heatmap des résultats).
6. **Journal (`/app/journal`)** : Partie "Diary". Permet au trader d'évaluer sa discipline quotidienne sur 10, son focus, et d'écrire ses leçons apprises.
7. **Settings (`/app/settings`)** : Gestion du profil, du thème, de l'abonnement SaaS, et configuration de la synchronisation automatique MT5.

---

## 🧠 6. Règles de Code & Bonnes Pratiques pour l'IA

Quand tu développes sur ce projet, respecte **toujours** ces règles :

1. **Design Premium & UX avant tout** : N'utilise jamais de couleurs basiques (rouge pur, bleu pur). Utilise les variables CSS définies dans Tailwind (ex: `bg-card`, `text-muted-foreground`). Ajoute toujours des effets de survol (`hover:bg-accent`), des transitions (`transition-all duration-200`) et des micro-animations avec Framer Motion.
2. **TypeScript Strict** : Pas de `any`. Si tu touches à un objet de base de données, utilise les types de `src/types`.
3. **Supabase** : Utilise les requêtes Supabase de manière sécurisée (toutes les tables ont des RLS `user_id = auth.uid()`). Préfère modifier les hooks existants dans `useDatabase.ts` plutôt que de faire des requêtes directes dans les composants.
4. **Zustand** : Le cache frontend est géré par `useStore.ts`. Après une mutation (insert/update/delete) dans Supabase via `useDatabase.ts`, on rappelle souvent `loadAllData()` pour rafraîchir le store global.
5. **Composants shadcn/ui** : Importe toujours depuis `@/components/ui/...`. Ne réinvente pas la roue (utilise les Select, Dialog, Button, Input existants).
6. **Architecture CSS** : Pas de fichiers CSS spécifiques par composant. Tout se fait via les classes utilitaires Tailwind CSS dans le TSX.

---
*Fichier de contexte généré pour l'assistant IA. À lire en début de session pour synchroniser l'état du projet.*
