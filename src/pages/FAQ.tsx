import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, HelpCircle, Lightbulb, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Category = 'auth' | 'accounts' | 'trades' | 'journal' | 'stats' | 'settings' | 'issues' | 'tips'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: Category
  tags: string[]
}

const faqData: FAQItem[] = [
  // Auth & Connexion
  {
    id: 'q1',
    category: 'auth',
    question: 'Comment créer un compte VAYNA ?',
    answer: `1. Cliquez sur "S'inscrire" depuis la page d'accueil
2. L'inscription se fait en 3 étapes :
   • Étape 1 - Identité : Entrez votre prénom, nom, âge (optionnel)
   • Étape 2 - Email : Saisissez une adresse email valide
   • Étape 3 - Sécurité : Créez un mot de passe (minimum 6 caractères)
3. Validez chaque étape
4. Vous êtes prêt !`,
    tags: ['inscription', 'démarrage', 'compte'],
  },
  {
    id: 'q2',
    category: 'auth',
    question: 'Puis-je me connecter avec Google ?',
    answer: `Oui ! Sur la page de connexion, cliquez sur "Connexion avec Google".
    
Avantages :
• Aucun mot de passe à retenir
• Prise en charge de vos données Google
• Connexion rapide et sécurisée`,
    tags: ['connexion', 'google', 'oauth'],
  },
  {
    id: 'q3',
    category: 'auth',
    question: "J'ai oublié mon mot de passe, que faire ?",
    answer: `1. Sur la page de connexion, cliquez sur "Mot de passe oublié?"
2. Entrez votre adresse email
3. Vérifiez votre boîte mail (+ dossier spam)
4. Cliquez sur le lien de réinitialisation
5. Créez un nouveau mot de passe
6. Reconnectez-vous

⏱️ Le lien est valide 24h.`,
    tags: ['sécurité', 'mot de passe', 'aide'],
  },
  {
    id: 'q4',
    category: 'auth',
    question: 'Comment me déconnecter ?',
    answer: `1. Ouvrez les Paramètres (⚙️ en bas à gauche)
2. Cliquez sur "Déconnexion"
3. Vous serez redirigé vers la page d'accueil`,
    tags: ['déconnexion', 'sécurité'],
  },

  // Gestion des comptes
  {
    id: 'q5',
    category: 'accounts',
    question: "Qu'est-ce qu'un compte dans VAYNA ?",
    answer: `Un compte représente une stratégie ou un compte de trading réel. Exemples :
    
• Compte prop firm (Topstep, Funded Trader)
• Compte personnel avec votre capital
• Sous-compte avec une stratégie spécifique
• Portefeuille crypto
• Compte avec un robot

Vous pouvez gérer plusieurs comptes en parallèle !`,
    tags: ['compte', 'gestion', 'trading'],
  },
  {
    id: 'q6',
    category: 'accounts',
    question: 'Comment créer un compte de trading ?',
    answer: `1. Allez en Comptes (menu latéral)
2. Cliquez sur "+ Nouveau compte"
3. Remplissez :
   • Nom du compte (obligatoire) : Ex: "Topstep Challenge"
   • Prop Firm (optionnel)
   • Capital initial : $50,000
   • Drawdown max (%) : 10%
   • Cible de profit (%) : 5%
   • Statut : Actif / Perdu / Validé
4. Cliquez "Créer"`,
    tags: ['compte', 'création', 'setup'],
  },
  {
    id: 'q7',
    category: 'accounts',
    question: 'Que signifie "Drawdown max" ?',
    answer: `Le drawdown maximum est la perte maximale acceptée avant de fermer le compte.

Exemple :
• Capital initial : $50,000
• Drawdown max : 10% = $5,000 max de perte
• Limite d'arrêt = $50,000 - $5,000 = $45,000

Si votre capital tombe à $45,000, votre compte est perdu.

Pourquoi ? Pour respecter les règles de la prop firm et limiter les risques.`,
    tags: ['drawdown', 'risque', 'gestion'],
  },

  // Trades
  {
    id: 'q8',
    category: 'trades',
    question: 'Quels sont les champs obligatoires pour ajouter un trade ?',
    answer: `1. Compte : Sélectionnez le compte
2. Date : Jour du trade
3. Asset : EUR/USD, AAPL, BTC, etc.
4. Timeframe : 1M, 5M, 15M, 1H, 4H, 1D
5. Direction : BUY (achat) ou SELL (vente)
6. Résultat : TP, SL, BE, GAIN, PERTE, BE+, BE-
7. P&L ($) : Montant du profit/perte
8. P&L (%) : Pourcentage du profit/perte

Les autres champs sont optionnels.`,
    tags: ['trade', 'ajout', 'fields'],
  },
  {
    id: 'q9',
    category: 'trades',
    question:
      "Qu'est-ce que le \"Résultat\" du trade ? (TP, SL, BE, etc.)",
    answer: `• **TP** : Take Profit atteint (fermé au prix cible)
• **SL** : Stop Loss déclenché (fermé au stop)
• **BE** : Break-Even (0, ni gain ni perte)
• **BE+** : Perte mineure (ex: -$20)
• **BE-** : Très petite perte (ex: -$5)
• **GAIN** : Gagnant sans TP strict
• **PERTE** : Perdu sans SL strict

Conseil : Utilisez TP/SL pour la discipline, GAIN/PERTE sinon.`,
    tags: ['trade', 'résultat', 'types'],
  },
  {
    id: 'q10',
    category: 'trades',
    question: 'Comment filtrer les trades ?',
    answer: `En haut de la page Trades, utilisez les filtres :

• 🔍 Recherche : Tapez un asset (EUR/USD, AAPL)
• 📊 Filtre par résultat : Gagnants, Perdants, Break-even
• 📈 Filtre par direction : BUY, SELL, Tous
• 📅 Filtre par date : Sélectionnez une plage

Exemple : Voir tous les trades perdus du mois dernier.`,
    tags: ['trade', 'filtre', 'recherche'],
  },
  {
    id: 'q11',
    category: 'trades',
    question: 'Comment exporter tous mes trades ?',
    answer: `1. Allez en Trades
2. Cliquez sur "Exporter en CSV" (en haut à droite)
3. Choisissez le compte
4. Le fichier se télécharge automatiquement

Format : CSV (compatible Excel, Google Sheets)

Usage : Analyser les données dans Excel, faire des rapports externes.`,
    tags: ['trade', 'export', 'csv'],
  },

  // Journal
  {
    id: 'q12',
    category: 'journal',
    question: 'Qu\'est-ce que le "Journal de session" ?',
    answer: `C'est un journal personnel de vos sessions de trading. Différent d'un trade :

• **Trade** = Un seul trade avec entrée/sortie
• **Journal entry** = Résumé de toute votre session

Utilité :
• Documenter votre état émotionnel
• Noter les erreurs/apprentissages
• Tracer votre discipline
• Analyser la psychologie du trading`,
    tags: ['journal', 'psychologie', 'session'],
  },
  {
    id: 'q13',
    category: 'journal',
    question: 'Quels éléments puis-je suivre dans le journal ?',
    answer: `• Date
• Titre (optionnel)
• Résumé (obligatoire)
• État mental : Excellent, Bon, Neutre, Mauvais, Terrible
• Discipline (1-10)
• Focus (1-10)
• Confiance (1-10)
• Condition marché : Tendance, Range, Volatile, etc.
• Setups identifiés
• Lessons learned
• Prochaines actions
• Tags personnalisés`,
    tags: ['journal', 'tracking', 'psycho'],
  },
  {
    id: 'q14',
    category: 'journal',
    question: 'Combien de temps faut-il pour remplir le journal ?',
    answer: `• Version rapide : 5-10 min (juste scores et résumé)
• Version complète : 15-30 min (tous les détails)

Conseil : Faites-la minimale chaque jour, la complète une fois par semaine.

Faites-le le soir après votre session (15-30 min).`,
    tags: ['journal', 'temps', 'workflow'],
  },

  // Dashboard & Stats
  {
    id: 'q15',
    category: 'stats',
    question: "Qu'affiche le Dashboard ?",
    answer: `Le Dashboard affiche :

• **Total trades** : Nombre total
• **P&L total** : Profit ou perte total en $
• **Win rate** : % de trades gagnants
• **Drawdown courant** : Perte actuelle vs initial
• **Drawdown max** : Seuil d'arrêt
• **Objectif** : Votre cible de profit
• **Capital courant** : Votre solde actuel

+ Graphique : Courbe d'équité (montée/descente du capital)`,
    tags: ['dashboard', 'stats', 'interface'],
  },
  {
    id: 'q16',
    category: 'stats',
    question: 'Comment sélectionner un compte sur le Dashboard ?',
    answer: `1. En haut du Dashboard, utilisez le sélecteur de compte 📊
2. Choisissez :
   • "Tous les comptes" (vue globale)
   • Un compte spécifique (vue isolée)
3. Les stats se mettent à jour automatiquement

Exemple : Voir les perfs de votre "Topstep" isolément.`,
    tags: ['dashboard', 'compte', 'filtre'],
  },
  {
    id: 'q17',
    category: 'stats',
    question: 'Comment interpréter ma courbe d\'équité ?',
    answer: `La courbe d'équité monte = gains, descend = pertes.

Exemple :
• Capital initial : $50,000
• Après 10 trades : courbe monte à $52,500
• Après 15 trades : courbe descend à $51,000

Conseil : Une courbe stable = bon trading. 
Une courbe chaotique = gestion de risque à revoir.`,
    tags: ['dashboard', 'équité', 'analyse'],
  },
  {
    id: 'q18',
    category: 'stats',
    question: "Qu'est-ce que le Profit Factor ?",
    answer: `C'est le ratio entre vos gains totaux et vos pertes totales.

Formule : Gains totaux / Pertes totales

Interprétation :
• **PF < 1.0** = Vous perdez plus que vous gagnez ❌
• **PF = 1.0** = Break-even (équilibré)
• **PF = 1.5** = Bon (pour 1$ perdu, vous gagnez $1.50)
• **PF = 2.0+** = Excellent

Objectif : Avoir un PF > 1.5 c'est du bon trading.`,
    tags: ['stats', 'profit factor', 'analyse'],
  },

  // Paramètres
  {
    id: 'q19',
    category: 'settings',
    question: 'Quels paramètres puis-je modifier ?',
    answer: `Allez en Paramètres (⚙️) pour modifier :

• **Profil** : Nom complet, Avatar
• **Sécurité** : Changement mot de passe
• **Apparence** : Thème clair/sombre
• **Notifications** : Email reminders, alertes`,
    tags: ['paramètres', 'settings', 'configuration'],
  },
  {
    id: 'q20',
    category: 'settings',
    question: 'Comment changer le thème (clair/sombre) ?',
    answer: `1. Allez en Paramètres > Apparence
2. Choisissez :
   • 🌞 Jour (blanc)
   • 🌙 Nuit (noir)
   • 🖥️ Système (suit votre système)
3. Le changement est immédiat

Conseil : Utilisez le mode sombre le soir pour réduire la fatigue oculaire.`,
    tags: ['theme', 'apparence', 'settings'],
  },

  // Problèmes courants
  {
    id: 'q21',
    category: 'issues',
    question: "Je ne peux pas me connecter",
    answer: `Solutions :
1. ✅ Vérifiez votre email (pas d'espace)
2. ✅ Vérifiez votre mot de passe (minuscule/majuscule)
3. ✅ Réinitialisez votre mot de passe ("Mot de passe oublié")
4. ✅ Vérifiez votre connexion internet
5. ✅ Videz le cache de l'app
6. ✅ Redémarrez l'application

Si le problème persiste → Contactez le support.`,
    tags: ['problème', 'connexion', 'aide'],
  },
  {
    id: 'q22',
    category: 'issues',
    question: "Je ne peux pas uploader un screenshot",
    answer: `Solutions :
1. ✅ Vérifiez le format : JPEG, PNG uniquement
2. ✅ Vérifiez la taille : Max 5MB
3. ✅ Vérifiez votre connexion internet
4. ✅ Fermez l'app et réouvrez

Si le problème persiste → Contactez le support.`,
    tags: ['problème', 'screenshot', 'upload'],
  },
  {
    id: 'q23',
    category: 'issues',
    question: "Les stats sont incorrectes sur le Dashboard",
    answer: `Solutions :
1. ✅ Vérifiez les trades : Sont-ils bien ajoutés ?
2. ✅ Vérifiez le compte sélectionné : Bon compte ?
3. ✅ Vérifiez la période : Tous les trades dans cette période ?
4. ✅ Rechargez la page (F5)

Erreur courante : Vous regardez "Ce mois" mais vos trades sont du mois dernier.`,
    tags: ['problème', 'stats', 'débogage'],
  },
  {
    id: 'q24',
    category: 'issues',
    question: "Mon mot de passe ne se met pas à jour",
    answer: `Solutions :
1. ✅ Vérifiez que l'ancien mot de passe est correct
2. ✅ Vérifiez que le nouveau mot de passe > 6 caractères
3. ✅ Vérifiez que la confirmation correspond
4. ✅ Attendez 30 sec et réessayez

Si le problème persiste → Réinitialisez via "Mot de passe oublié".`,
    tags: ['problème', 'sécurité', 'help'],
  },

  // Tips
  {
    id: 'tip1',
    category: 'tips',
    question: '💡 5 premières étapes pour bien démarrer',
    answer: `1. Créer un compte de trading (2 min)
2. Ajouter votre capital initial (1 min)
3. Ajouter votre premier trade (3 min)
4. Remplir le journal de session si besoin (5 min)
5. Consulter le Dashboard pour voir vos stats (2 min)

Total : ~13 minutes pour bien démarrer !`,
    tags: ['conseil', 'démarrage', 'workflow'],
  },
  {
    id: 'tip2',
    category: 'tips',
    question: '💡 Combien de temps trader par jour ?',
    answer: `Conseil basé sur les meilleures pratiques :

• Minimum : 15 min (vérifier les marchés, tracker)
• Moyen : 30-60 min (trading actif + journal)
• Avancé : 2-4h (plusieurs comptes, analyse complète)

Important : La qualité > quantité. Mieux vaut 30 min disciplinées que 8h chaotiques.`,
    tags: ['conseil', 'workflow', 'discipline'],
  },
  {
    id: 'tip3',
    category: 'tips',
    question: '💡 À quoi sert vraiment le journal ?',
    answer: `Le journal est la clé de la psychologie du trading.

Après 3 semaines, vous découvrirez :
• "Je perds -30% winrate avant 9am"
• "Je suis plus discipliné l'après-midi"
• "Quand je suis stressé, je over-trade"

Puis vous fixez ces problèmes → Résultats s'améliorent.

La plupart des traders abandonnent le journal.
Les meilleurs le remplissent tous les jours.`,
    tags: ['conseil', 'journal', 'psycho'],
  },
  {
    id: 'tip4',
    category: 'tips',
    question: '💡 Quel est le risque idéal par trade ?',
    answer: `Règle professionnelle : 1-2% MAX par trade

Exemple :
• Capital : $50,000
• Risque : 1% = $500 par trade
• Stop Loss : $500 maximum d'exposition

Pourquoi ?
• Survive les losing streaks (10 pertes = -10%)
• La psychologie reste stable
• Respecte règles prop firm (généralement 5-10% drawdown max)`,
    tags: ['conseil', 'risque', 'discipline'],
  },
]

const categories: { value: Category; label: string; icon: string }[] = [
  { value: 'auth', label: 'Compte & Connexion', icon: '🔐' },
  { value: 'accounts', label: 'Gestion comptes', icon: '💰' },
  { value: 'trades', label: 'Trades', icon: '📊' },
  { value: 'journal', label: 'Journal', icon: '📝' },
  { value: 'stats', label: 'Statistiques', icon: '📈' },
  { value: 'settings', label: 'Paramètres', icon: '⚙️' },
  { value: 'issues', label: 'Problèmes', icon: '🆘' },
  { value: 'tips', label: 'Conseils', icon: '💡' },
]

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const filteredFAQ = useMemo(() => {
    return faqData.filter((item) => {
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <HelpCircle className="text-primary" size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Centre d'aide</h1>
            <p className="text-sm text-muted-foreground">
              Trouvez les réponses à vos questions
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <Input
            placeholder="Cherchez une question, un mot-clé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2"
      >
        <Badge
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('all')}
        >
          Tous ({faqData.length})
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.icon} {cat.label} ({faqData.filter((f) => f.category === cat.value).length})
          </Badge>
        ))}
      </motion.div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredFAQ.length} résultat{filteredFAQ.length !== 1 ? 's' : ''}
        {searchQuery && ` pour "${searchQuery}"`}
      </p>

      {/* FAQ Items */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        {filteredFAQ.length > 0 ? (
          filteredFAQ.map((item) => {
            const category = categories.find((c) => c.value === item.category)
            const isOpen = openId === item.id

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border hover:border-primary/50 transition-colors overflow-hidden">
                  <button
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="w-full text-left flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{category?.icon}</span>
                        <span className="font-semibold text-foreground">
                          {item.question}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 transition-transform duration-200 ml-2 flex-shrink-0 text-muted-foreground',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border"
                    >
                      <CardContent className="pt-4 pb-4 text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                        {item.answer}
                      </CardContent>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            )
          })
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb size={40} className="text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground text-center">
                Aucun résultat trouvé. Essayez un autre mot-clé ou catégorie.
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Footer tip */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Lightbulb className="text-primary flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                💡 Conseil : Utilisez la recherche
              </p>
              <p className="text-xs text-muted-foreground">
                Tapez un mot-clé pour trouver rapidement votre réponse. Cherchez
                "drawdown", "export", "screenshot", etc.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
