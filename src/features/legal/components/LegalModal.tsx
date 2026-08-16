import * as Dialog from '@radix-ui/react-dialog'
import { X, Download } from 'lucide-react'
import { useState, useRef } from 'react'
import { TermsContent } from './TermsContent'
import { PrivacyContent } from './PrivacyContent'

interface LegalModalProps {
  type: 'terms' | 'privacy'
  isOpen: boolean
  onClose: () => void
}

export function LegalModal({ type, isOpen, onClose }: LegalModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const title = type === 'terms' ? 'CGU' : 'Confidentialité'
  const filename = type === 'terms' ? 'vayna-cgu.pdf' : 'vayna-confidentialite.pdf'

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return
    
    setIsGenerating(true)
    
    try {
      // Load html2pdf dynamically from local public folder to avoid CDN blocks
      if (!(window as any).html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = '/html2pdf.bundle.min.js' // Loads from public folder
          script.onload = resolve
          script.onerror = () => {
            console.error('Failed to load html2pdf script')
            reject(new Error('Failed to load html2pdf script'))
          }
          document.head.appendChild(script)
        })
      }
      
      const opt = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      
      // Generate the PDF as a Blob first
      const pdfWorker = (window as any).html2pdf().set(opt).from(contentRef.current);
      const pdfBlob = await pdfWorker.output('blob');
      
      // Try to use the modern File System Access API to force a "Save As" dialog
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'Fichier PDF',
              accept: { 'application/pdf': ['.pdf'] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(pdfBlob);
          await writable.close();
        } catch (err: any) {
          // If user cancels the picker, don't do the fallback
          if (err.name !== 'AbortError') {
            throw err;
          }
        }
      } else {
        // Fallback for browsers (like Firefox or mobile) that don't support showSaveFilePicker
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[101] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
          
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-800 bg-slate-900/50">
            <Dialog.Title className="text-base sm:text-lg font-semibold text-white line-clamp-1 mr-2">
              {title}
            </Dialog.Title>
            
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <Download size={16} className="shrink-0" />
                <span className="hidden sm:inline">{isGenerating ? 'Génération...' : 'Télécharger en PDF'}</span>
                <span className="sm:hidden">{isGenerating ? '...' : 'PDF'}</span>
              </button>
              
              <Dialog.Close asChild>
                <button
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                  aria-label="Fermer"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <div ref={contentRef} className="bg-white text-slate-900 p-5 sm:p-8 rounded-lg shadow-sm print-container">
              {type === 'terms' ? <TermsContent /> : <PrivacyContent />}
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
