
interface TermsCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export function TermsCheckbox({ checked, onCheckedChange, disabled = false }: TermsCheckboxProps) {
  return (
    <div className="flex items-start space-x-3 mt-4">
      <input
        type="checkbox"
        id="terms-checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 h-4 w-4 shrink-0 rounded border border-cyan-500/30 bg-slate-900/50 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950"
      />
      <div className="grid gap-1.5 leading-none">
        <label 
          htmlFor="terms-checkbox" 
          className="text-sm font-medium leading-tight text-slate-300 cursor-pointer"
        >
          J'ai lu et j'accepte les{' '}
          <a 
            href="#/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Conditions d'utilisation
          </a>
          {' '}et la{' '}
          <a 
            href="#/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Politique de confidentialité
          </a>
          {' '}de VAYNA.
        </label>
        <p className="text-xs text-slate-500 mt-1">
          Vous devez accepter ces conditions pour créer un compte.
        </p>
      </div>
    </div>
  )
}
