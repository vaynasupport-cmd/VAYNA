export function PrivacyContent() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Politique de Confidentialité</h1>
        <p className="text-slate-500 text-xs pb-4 border-b border-slate-200">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-cyan-600">
        <p>
          Chez VAYNA, nous accordons une importance primordiale à la confidentialité et à la sécurité de vos données personnelles et financières. Cette Politique de Confidentialité vous explique comment nous collectons, utilisons, partageons et protégeons vos informations dans le cadre du Règlement Général sur la Protection des Données (RGPD).
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">1. Données collectées</h2>
        <p>Nous collectons les types de données suivants :</p>
        <ul className="list-disc pl-5">
          <li><strong>Données d'identification :</strong> Nom, prénom, adresse e-mail, âge, genre (lors de la création du compte via formulaire ou Google Auth).</li>
          <li><strong>Données de trading (via MetaTrader 5) :</strong> Historique de vos transactions, paires tradées, volumes, profits, pertes, balance du compte, et équité.</li>
          <li><strong>Données de connexion :</strong> Adresse IP, type d'appareil, et logs de connexion sécurisés via notre fournisseur d'authentification (Supabase).</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">2. Finalité de la collecte</h2>
        <p>Vos données sont exclusivement utilisées pour :</p>
        <ul className="list-disc pl-5">
          <li>Vous fournir le service de journal de trading VAYNA et ses statistiques avancées.</li>
          <li>Synchroniser vos trades en temps réel depuis votre terminal MetaTrader 5.</li>
          <li>Améliorer l'expérience utilisateur et résoudre les problèmes techniques.</li>
          <li>Garantir la sécurité de votre compte et prévenir la fraude.</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">3. Stockage et Sécurité des données</h2>
        <p>
          L'ensemble de vos données, y compris votre historique de trading, est stocké de manière sécurisée sur les serveurs européens de <strong>Supabase</strong>, qui appliquent les standards de sécurité les plus stricts de l'industrie (chiffrement au repos et en transit, conformité SOC2).
        </p>
        <p>
          <strong>Important :</strong> VAYNA n'a <strong>jamais</strong> accès à vos mots de passe MetaTrader ni à la possibilité de passer des ordres sur votre compte. Notre script de synchronisation fonctionne en lecture seule (Read-Only).
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">4. Partage des données</h2>
        <p>
          Nous ne vendons <strong>jamais</strong> vos données personnelles ou financières à des tiers. Vos données peuvent uniquement être partagées avec nos prestataires techniques strictement nécessaires au fonctionnement de l'application (ex: hébergeurs de la base de données).
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">5. Vos droits (RGPD)</h2>
        <p>Conformément à la réglementation européenne, vous disposez des droits suivants :</p>
        <ul className="list-disc pl-5">
          <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données.</li>
          <li><strong>Droit de rectification :</strong> Corriger des données inexactes.</li>
          <li><strong>Droit à l'effacement (Droit à l'oubli) :</strong> Demander la suppression définitive de votre compte et de tout votre historique de trading depuis vos paramètres de compte.</li>
          <li><strong>Droit à la portabilité :</strong> Exporter votre historique de trading.</li>
        </ul>
        <p>
          Pour exercer ces droits, veuillez nous contacter à l'adresse suivante : <a href="mailto:vayna.support@gmail.com">vayna.support@gmail.com</a>
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">6. Cookies et traceurs</h2>
        <p>
          VAYNA utilise uniquement des cookies "strictement nécessaires" au fonctionnement de l'application (maintien de la session utilisateur via Supabase Auth). Nous n'utilisons aucun cookie de ciblage publicitaire intrusif.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3 text-cyan-600">7. Modifications de la politique</h2>
        <p>
          Nous pouvons être amenés à mettre à jour cette politique. En cas de modification majeure impactant le traitement de vos données, nous vous en informerons par e-mail ou via une notification sur votre tableau de bord.
        </p>
      </div>
    </>
  )
}
