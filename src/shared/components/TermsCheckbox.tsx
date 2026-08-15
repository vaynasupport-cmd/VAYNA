import { useState } from 'react'
import { LegalModal } from '@/features/legal/components/LegalModal'

interface TermsCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  error?: string
}

export function TermsCheckbox({ checked, onCheckedChange, disabled = false, error }: TermsCheckboxProps) {
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null)

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex items-start space-x-3">
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
            className="text-sm font-medium leading-tight text-slate-300 cursor-pointer select-none"
          >
            J'ai lu et j'accepte les{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setModalType('terms')
              }}
              className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors focus:outline-none"
            >
              Conditions d'utilisation
            </button>
            {' '}et la{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setModalType('privacy')
              }}
              className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors focus:outline-none"
            >
              Politique de confidentialité
            </button>
            {' '}de VAYNA.
          </label>
          <p className="text-xs text-slate-500 mt-1">
            Vous devez accepter ces conditions pour créer un compte.
          </p>
        </div>
      </div>
      
      {error && (
        <p className="text-xs text-red-400 pl-8">{error}</p>
      )}

      <LegalModal
        type={modalType || 'terms'}
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
      />
    </div>
  )
}
