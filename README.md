# Trading Journal Pro

Application Desktop de Journal de Trading pour Windows 11 - 100% Offline, Stockage Local SQLite.

## 🎯 Caractéristiques

- **Application Desktop Native** - Pas de navigateur, pas de cloud
- **100% Offline** - Toutes vos données restent sur votre PC
- **Stockage Local SQLite** - Base de données robuste et rapide
- **UI Premium** - Design moderne inspiré de Notion, TradingView, Linear
- **Animations Fluides** - Micro-interactions avec Framer Motion
- **Graphiques Avancés** - Courbes d'equity, statistiques détaillées

## 🚀 Technologies

- **Electron** - Framework desktop
- **React + TypeScript** - Frontend moderne
- **Tailwind CSS + shadcn/ui** - UI premium
- **Framer Motion** - Animations fluides
- **Recharts** - Graphiques interactifs
- **better-sqlite3** - Base de données locale
- **electron-builder** - Packaging Windows

## 📁 Structure du Projet

```
trading-journal-app/
├── electron/                 # Code Electron (main + preload)
│   ├── main.ts              # Processus principal
│   ├── preload.ts           # Bridge IPC
│   ├── database/
│   │   └── DatabaseManager.ts  # Gestion SQLite
│   └── tsconfig.json
├── src/
│   ├── components/          # Composants React
│   │   ├── ui/             # Composants shadcn/ui
│   │   ├── Sidebar.tsx
│   │   ├── Layout.tsx
│   │   ├── StatCard.tsx
│   │   ├── EquityChart.tsx
│   │   └── AccountSelector.tsx
│   ├── pages/              # Pages de l'application
│   │   ├── Dashboard.tsx
│   │   ├── Accounts.tsx
│   │   ├── Trades.tsx
│   │   ├── Statistics.tsx
│   │   └── Journal.tsx
│   ├── hooks/              # Custom hooks
│   │   ├── useStore.ts     # Zustand store
│   │   ├── useDatabase.ts  # Database operations
│   │   └── useToast.ts
│   ├── types/              # TypeScript types
│   ├── lib/                # Utilities
│   └── styles/             # Styles globaux
├── build/                  # Ressources de build
├── dist/                   # Build React (production)
├── dist-electron/          # Build Electron (production)
└── release/                # Installateurs générés
```

## 🛠️ Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Windows 10/11

### Étapes

1. **Cloner et naviguer dans le projet**
```bash
cd trading-journal-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer en mode développement**
```bash
npm run dev
```

## 📦 Build et Distribution

### Build de production
```bash
npm run build
```

### Créer l'installateur Windows (.exe)
```bash
npm run dist:win
```

### Créer un portable (.exe sans installation)
```bash
npm run dist
```

Les installateurs seront générés dans le dossier `release/`.

## 🎨 Fonctionnalités

### Dashboard
- Vue d'ensemble de la performance
- Courbe d'equity animée
- Statistiques clés (P&L, Winrate, Drawdown)
- Sélecteur de compte instantané

### Gestion des Comptes
- Comptes Prop Firms multiples
- Suivi du capital et des objectifs
- Drawdown en temps réel
- Statuts (Actif/Perdu/Validé)

### Journal de Trading
- Enregistrement détaillé des trades
- Screenshots avec zoom
- Tags émotionnels
- Calcul automatique du R-Multiple
- Filtres et recherche

### Statistiques Avancées
- Winrate, Profit Factor, Expectancy
- Distribution des résultats
- Performance mensuelle
- Séries de victoires/défaites

### Journal Personnel
- Notes quotidiennes
- État mental et discipline
- Système de tags
- Analyse d'erreurs

## ⚙️ Configuration

La base de données SQLite est stockée dans :
```
%APPDATA%/Trading Journal Pro/trading-journal.db
```

## 🔒 Sécurité

- Toutes les données sont stockées localement
- Aucune connexion internet requise
- Aucune donnée envoyée vers des serveurs externes

## 📝 License

MIT License - Projet open source

---

**Trading Journal Pro** - Votre compagnon de trading professionnel
