import { AlertCircle } from 'lucide-react'

export function TermsContent() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Conditions Générales d'Utilisation</h1>
        <p className="text-slate-500 text-xs pb-4 border-b border-slate-200">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-6">
        <h3 className="text-orange-800 font-semibold mb-2 flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          Avertissement Légal et Financier
        </h3>
        <p className="text-xs text-orange-700 leading-relaxed">
          VAYNA est un journal de trading et un outil d'analyse de performance. Nous ne fournissons aucun conseil financier, recommandation d'investissement, ou promesse de rentabilité. Le trading de CFD, Forex et Cryptomonnaies comporte des risques élevés de perte en capital. Les utilisateurs sont seuls responsables de leurs décisions d'investissement.
        </p>
      </div>

      <div className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-cyan-600">
        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">Article 1 - Mentions légales</h2>
        <p>
          L'application VAYNA est éditée par Abderraouf Taibi (Projet VAYNA en cours d'immatriculation), dont le siège social est situé à Tizi Ouzou (Algérie).<br/>
          Contact email : <a href="mailto:vayna.support@gmail.com">vayna.support@gmail.com</a>
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">Article 2 - Objet</h2>
        <p>
          Les présentes Conditions Générales d'Utilisation (ci-après "CGU") ont pour objet de définir les conditions et modalités dans lesquelles VAYNA met à disposition de ses utilisateurs son outil de journal de trading et d'analyse de données (via l'intégration MetaTrader 5).
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">Article 3 - Accès au service</h2>
        <p>
          L'accès à VAYNA nécessite la création d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes. VAYNA se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes CGU.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">Article 4 - Propriété intellectuelle</h2>
        <p>
          La structure générale, ainsi que les logiciels, textes, images animées ou non, son savoir-faire et tous les autres éléments composant le site sont la propriété exclusive de VAYNA. Toute représentation totale ou partielle sans l'autorisation expresse de l'exploitant est interdite.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-orange-600">Article 5 - Responsabilité</h2>
        <p>
          L'utilisateur assume l'entière responsabilité de l'utilisation qu'il fait des informations et outils mis à disposition sur VAYNA.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">Article 6 - Données personnelles (RGPD)</h2>
        <p>
          La collecte et le traitement des données des utilisateurs sont effectués dans le respect de la législation en vigueur.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">Article 7 - Abonnements et Paiements</h2>
        <p>
          L'utilisation des fonctionnalités Premium de VAYNA est soumise à la souscription d'un abonnement. Les conditions tarifaires et de renouvellement sont détaillées lors du processus de paiement.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">Article 8 - Comportement de l'utilisateur</h2>
        <p>
          L'utilisateur s'interdit toute action pouvant porter atteinte à la sécurité informatique de VAYNA, ainsi que l'utilisation de bots ou scripts non autorisés.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">Article 9 - Modification des CGU</h2>
        <p>
          VAYNA se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications substantielles lors de leur connexion.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">Article 10 - Droit applicable et juridiction compétente</h2>
        <p>
          La législation algérienne s'applique au présent contrat. En cas d'absence de résolution amiable d'un litige né entre les parties, les tribunaux de Tizi Ouzou (Algérie) seront seuls compétents.
        </p>
      </div>
    </>
  )
}
