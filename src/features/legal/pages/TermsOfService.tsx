import { VaynaLogo } from '@/components/VaynaLogo'
import { Link } from 'react-router-dom'
import { AlertCircle, ChevronLeft } from 'lucide-react'

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            Retour à l'accueil
          </Link>
          <VaynaLogo size={32} showText />
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-xl backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Conditions Générales d'Utilisation</h1>
          <p className="text-slate-400 text-sm mb-8 pb-8 border-b border-slate-800">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <div className="p-4 bg-orange-950/20 border border-orange-900/50 rounded-lg mb-8">
            <h3 className="text-orange-500 font-semibold mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Avertissement Légal et Financier
            </h3>
            <p className="text-sm text-orange-200/80 leading-relaxed">
              VAYNA est un journal de trading et un outil d'analyse de performance. Nous ne fournissons aucun conseil financier, recommandation d'investissement, ou promesse de rentabilité. Le trading de CFD, Forex et Cryptomonnaies comporte des risques élevés de perte en capital. Les utilisateurs sont seuls responsables de leurs décisions d'investissement.
            </p>
          </div>

          <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">Article 1 - Mentions légales</h2>
            <p>
              L'application VAYNA est éditée par [NOM_DE_LA_SOCIETE], société [FORME_JURIDIQUE] au capital de [MONTANT] €, dont le siège social est situé au [ADRESSE_COMPLETE], immatriculée au Registre du Commerce et des Sociétés de [VILLE] sous le numéro [NUMERO_SIRET].<br/>
              Contact email : <a href="mailto:[EMAIL_CONTACT]">[EMAIL_CONTACT]</a>
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">Article 2 - Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (ci-après "CGU") ont pour objet de définir les conditions et modalités dans lesquelles VAYNA met à disposition de ses utilisateurs son outil de journal de trading et d'analyse de données (via l'intégration MetaTrader 5).
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">Article 3 - Accès au service</h2>
            <p>
              L'accès à VAYNA nécessite la création d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes. VAYNA se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes CGU.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">Article 4 - Propriété intellectuelle</h2>
            <p>
              La structure générale, ainsi que les logiciels, textes, images animées ou non, son savoir-faire et tous les autres éléments composant le site sont la propriété exclusive de VAYNA. Toute représentation totale ou partielle sans l'autorisation expresse de l'exploitant est interdite.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-orange-400">Article 5 - Responsabilité (En attente de relecture juridique)</h2>
            <p className="text-slate-400 italic">
              [Placeholder pour la clause de non-responsabilité complète concernant les pertes liées au trading, les bugs de synchronisation MT5, et les interruptions de service de l'hébergeur.]
            </p>
            <p>
              L'utilisateur assume l'entière responsabilité de l'utilisation qu'il fait des informations et outils mis à disposition sur VAYNA.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">Article 6 - Données personnelles (RGPD)</h2>
            <p>
              La collecte et le traitement des données des utilisateurs sont effectués dans le respect de la législation en vigueur. Pour plus de détails, veuillez consulter notre <Link to="/privacy">Politique de Confidentialité</Link>.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">Article 7 - Abonnements et Paiements</h2>
            <p>
              L'utilisation des fonctionnalités Premium de VAYNA est soumise à la souscription d'un abonnement. Les conditions tarifaires et de renouvellement sont détaillées lors du processus de paiement.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-orange-400">Article 8 - Disponibilité de l'API MetaTrader 5 (En attente de relecture juridique)</h2>
            <p className="text-slate-400 italic">
              [Placeholder pour les limitations techniques liées au script Python de synchronisation et la dépendance aux serveurs des brokers.]
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">Article 9 - Comportement de l'utilisateur</h2>
            <p>
              L'utilisateur s'interdit toute action pouvant porter atteinte à la sécurité informatique de VAYNA, ainsi que l'utilisation de bots ou scripts non autorisés (en dehors du script officiel fourni par VAYNA).
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">Article 10 - Liens hypertextes</h2>
            <p>
              VAYNA peut contenir des liens vers des sites tiers. L'éditeur décline toute responsabilité quant au contenu de ces sites.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">Article 11 - Modification des CGU</h2>
            <p>
              VAYNA se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications substantielles lors de leur connexion.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-orange-400">Article 12 - Résiliation (En attente de relecture juridique)</h2>
            <p className="text-slate-400 italic">
              [Placeholder pour la procédure de suppression de compte, le droit à l'oubli et le délai de conservation des données de trading (historique MT5).]
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-cyan-400">Article 13 - Droit applicable et juridiction compétente</h2>
            <p>
              La législation française s'applique au présent contrat. En cas d'absence de résolution amiable d'un litige né entre les parties, les tribunaux du ressort de la Cour d'appel de [VILLE] seront seuls compétents.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
