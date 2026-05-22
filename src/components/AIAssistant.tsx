import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { X, Send, Loader2, AlertCircle, Plus, MessageSquare, Trash2, History, ChevronLeft, MessageCircle, ChevronRight, Pencil, Reply, CornerDownRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { VaynaLogo } from '@/components/VaynaLogo'
import { useStore } from '@/hooks/useStore'
import { useDatabase } from '@/hooks/useDatabase'
import { cn } from '@/lib/utils'
import { calculateAdvancedStats, calculateAssetPerformance } from '@/lib/statsCalculator'

type FunctionCallData = {
  name: string;
  args: Record<string, any>;
  status: 'pending' | 'executed' | 'cancelled';
}

type Message = {
  id: string
  role: 'user' | 'assistant' | 'system' | 'function'
  content: string
  functionCall?: FunctionCallData
}

type ChatSession = {
  id: string
  title: string
  messages: Message[]
  updatedAt: number
}

const getInitialMessage = (): Message => ({
  id: Date.now().toString(),
  role: 'assistant',
  content: 'Bonjour ! Je suis l\'assistant IA de **VAYNA**. Comment puis-je vous aider avec votre trading aujourd\'hui ?'
})

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  
  // Persistent sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('vayna_ai_sessions')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return []
  })
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editInput, setEditInput] = useState('')
  const [replyingToMessageId, setReplyingToMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  
  const accounts = useStore(s => s.accounts)
  const trades = useStore(s => s.trades)
  const selectedAccountId = useStore(s => s.selectedAccountId)
  const { createTrade, deleteAllTrades } = useDatabase()
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('vayna_ai_sessions', JSON.stringify(sessions))
  }, [sessions])

  // Initialize session if none exists when opening
  useEffect(() => {
    if (isOpen) {
      if (sessions.length === 0) {
        handleNewChat()
      } else if (!currentSessionId) {
        setCurrentSessionId(sessions[0].id)
      }
    }
  }, [isOpen])

  const currentSession = sessions.find(s => s.id === currentSessionId)
  const messages = currentSession?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!showHistory) {
      scrollToBottom()
    }
  }, [messages, showHistory, isLoading])

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nouvelle discussion',
      messages: [getInitialMessage()],
      updatedAt: Date.now()
    }
    setSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setShowHistory(false)
  }

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const newSessions = sessions.filter(s => s.id !== id)
    setSessions(newSessions)
    if (currentSessionId === id) {
      setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null)
    }
    if (newSessions.length === 0) {
      setShowHistory(false)
    }
  }

  const generateSystemContext = () => {
    const totalTrades = trades.length
    const winningTrades = trades.filter(t => t.result === 'GAIN').length
    const winrate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnlAmount || 0), 0)

    const accountsInfo = accounts.map(a => 
      `- Compte "${a.name}" (${a.propFirm || 'Personnel'}) : Capital Initial = ${a.initialCapital}$ | Capital Actuel = ${a.currentCapital}$ | Statut = ${a.status}`
    ).join('\n')

    const advancedStats = calculateAdvancedStats(trades, selectedAccountId ? { accountId: selectedAccountId } : undefined)
    const assetPerf = calculateAssetPerformance(trades, selectedAccountId ? { accountId: selectedAccountId } : undefined)
    
    const bestAssets = [...assetPerf].filter(a => a.pnl > 0).slice(0, 3).map(a => `${a.asset} (+${a.pnl.toFixed(2)}$)`).join(', ') || 'Aucun'
    const worstAssets = [...assetPerf].filter(a => a.pnl < 0).reverse().slice(0, 3).map(a => `${a.asset} (${a.pnl.toFixed(2)}$)`).join(', ') || 'Aucun'

    return `Tu es l'Agent IA Fintech de VAYNA (Vayna Bot). Ton rôle est d'accompagner le trader.

DATE DU JOUR : ${new Date().toISOString().split('T')[0]} (Utilise toujours cette date par défaut pour les ajouts de trades si l'utilisateur ne précise rien).

RÈGLES STRICTES ET IMPÉRATIVES (SCOPE) :
1. Tu ne dois répondre qu'aux questions concernant : VAYNA, le trading, le journal de trading, la psychologie du trading, les brokers, MT5, prop firms, et les statistiques de l'utilisateur.
2. Si la question de l'utilisateur est complètement hors-sujet (ex: cuisine, politique, blagues, code générique non lié au projet), tu DOIS refuser de répondre poliment en expliquant que tu es un assistant de trading exclusif à VAYNA.
3. Ne jamais inventer ou promettre une fonctionnalité qui n'existe pas.
4. Tes réponses doivent être concises, rapides, professionnelles (style Stripe/Revolut).
5. Utilise le gras pour mettre en évidence les chiffres clés ou concepts importants.
6. Ne demande pas de détails personnels hors trading.
7. Ne donne pas de conseils financiers d'investissement directs (avertissement sur les risques).
8. IMPORTANT (FALLBACK) : Si tu dois exécuter une action mais qu'il te manque des informations (ex: pour ajouter un trade, il te faut impérativement la paire, la direction, le pnl et la date), demande explicitement ces informations à l'utilisateur AVANT d'exécuter l'action. Ne devine jamais les valeurs manquantes.

NAVIGATION INTÉGRÉE (DEEP LINKING) :
Tu as la capacité de rediriger l'utilisateur vers différentes pages de l'application. 
Pour ce faire, utilise STRICTEMENT le format Markdown de lien suivant : "[Texte du Bouton](/app/route)".
Voici la liste EXHAUSTIVE des routes que tu peux utiliser :
- Dashboard Central : "/app/dashboard"
- Gestion des Comptes de trading : "/app/accounts"
- Historique des Trades : "/app/trades"
- Statistiques Avancées : "/app/statistics"
- Calendrier & Journal : "/app/journal"
- Synchronisation Broker & MT5 : "/app/mt5-sync"
- Paramètres & Abonnement : "/app/settings"
Exemple de réponse attendue : "Pour connecter MT5, rendez-vous ici : [Connecter MT5](/app/mt5-sync)"

STATISTIQUES EN TEMPS RÉEL DU TRADER :
- Nombre total de trades : ${totalTrades}
- Winrate global : ${winrate}%
- PnL global : ${totalPnl.toFixed(2)}$
- Nombre de comptes connectés : ${accounts.length}
- Profit Factor : ${advancedStats.profitFactor.toFixed(2)}
- Gain Moyen : ${advancedStats.avgWin.toFixed(2)}$
- Perte Moyenne : ${advancedStats.avgLoss.toFixed(2)}$
- Série max gagnante : ${advancedStats.maxConsecutiveWins} trades
- Série max perdante : ${advancedStats.maxConsecutiveLosses} trades
- Meilleurs actifs (Top 3) : ${bestAssets}
- Pires actifs (Flop 3) : ${worstAssets}

DÉTAILS DES COMPTES :
${accountsInfo || 'Aucun compte connecté.'}

L'utilisateur te parle maintenant :`
  }

  const updateSessionMessages = (sessionId: string, newMessages: Message[], newTitle?: string) => {
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            title: newTitle || s.title,
            updatedAt: Date.now(),
            messages: newMessages
          }
        }
        return s
      })
      return updated.sort((a, b) => b.updatedAt - a.updatedAt)
    })
  }

  const handleSend = async (editContent?: string, editMsgId?: string) => {
    const contentToSend = editContent !== undefined ? editContent : input
    if (!contentToSend.trim() || !currentSessionId) return

    let finalContent = contentToSend.trim()
    let baseMessages = messages
    
    if (editMsgId) {
      const idx = messages.findIndex(m => m.id === editMsgId)
      if (idx !== -1) baseMessages = messages.slice(0, idx)
    } else {
      setInput('')
      if (replyingToMessageId) {
        const repliedMsg = messages.find(m => m.id === replyingToMessageId)
        if (repliedMsg) {
          finalContent = `[En réponse à : "${repliedMsg.content.substring(0, 100)}..."]\n\n${finalContent}`
        }
        setReplyingToMessageId(null)
      }
    }
    
    const newMessages: Message[] = [
      ...baseMessages,
      { id: Date.now().toString(), role: 'user', content: finalContent }
    ]
    
    const isFirstUserMessage = currentSession?.title === 'Nouvelle discussion'
    const newTitle = isFirstUserMessage ? (finalContent.length > 25 ? finalContent.slice(0, 25) + '...' : finalContent) : undefined
    
    updateSessionMessages(currentSessionId, newMessages, newTitle)

    if (!apiKey) {
      updateSessionMessages(currentSessionId, [
        ...newMessages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '⚠️ **Clé API manquante.** Pour m\'utiliser, veuillez ajouter `VITE_GEMINI_API_KEY=votre_cle` dans le fichier `.env` à la racine de votre projet.'
        }
      ])
      return
    }

    setIsLoading(true)

    try {
      const contents = newMessages.map(m => {
        if (m.role === 'function') {
          return {
            role: 'function',
            parts: [{ functionResponse: { name: m.functionCall?.name || 'unknown', response: { result: m.content } } }]
          }
        }
        if (m.functionCall) {
          return {
            role: 'model',
            parts: [{ functionCall: { name: m.functionCall.name, args: m.functionCall.args } }]
          }
        }
        return {
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }
      })

      contents[0] = {
        role: 'user',
        parts: [{ text: generateSystemContext() + '\n\n' + (contents[0].parts as any)[0].text }]
      }

      const tools = [{
        functionDeclarations: [
          {
            name: "sync_mt5",
            description: "Lance une synchronisation manuelle avec le compte MetaTrader 5 pour récupérer les derniers trades."
          },
          {
            name: "delete_all_trades",
            description: "Supprime tous les trades du journal (Action très dangereuse)."
          },
          {
            name: "add_trade",
            description: "Ajoute un nouveau trade manuellement au journal.",
            parameters: {
              type: "OBJECT",
              properties: {
                pair: { type: "STRING", description: "La paire ou l'actif tradé, ex: EURUSD, XAUUSD, NAS100" },
                direction: { type: "STRING", description: "BUY ou SELL" },
                pnl: { type: "NUMBER", description: "Le profit (positif) ou la perte (négatif) du trade en dollars" },
                date: { type: "STRING", description: "La date du trade au format YYYY-MM-DD" },
                timeframe: { type: "STRING", description: "L'unité de temps du trade, ex: M1, M5, M15, H1, H4, D1. Si l'utilisateur ne précise pas, utilise M15 par défaut." }
              },
              required: ["pair", "direction", "pnl", "date", "timeframe"]
            }
          }
        ]
      }]

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, tools })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Erreur API Gemini')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Streaming non supporté par le navigateur.')

      const decoder = new TextDecoder()
      let aiText = ''
      const assistantMessageId = Date.now().toString()

      // Inject empty message to start streaming
      updateSessionMessages(currentSessionId, [
        ...newMessages,
        { id: assistantMessageId, role: 'assistant', content: '' }
      ])
      
      setIsLoading(false) // Stop global loader since we start streaming

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            if (dataStr.trim() === '[DONE]') continue
            
            try {
              const data = JSON.parse(dataStr)
              
              // Handle Function Call
              const fnCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall
              if (fnCall) {
                setSessions(prev => prev.map(s => {
                  if (s.id === currentSessionId) {
                    const msgs = [...s.messages]
                    const lastIdx = msgs.length - 1
                    msgs[lastIdx] = { 
                      ...msgs[lastIdx], 
                      content: "Je dois exécuter une action système. Veuillez confirmer.",
                      functionCall: { name: fnCall.name, args: fnCall.args, status: 'pending' } 
                    }
                    return { ...s, messages: msgs }
                  }
                  return s
                }))
                break // Stop streaming since we need user input
              }

              // Handle Normal Text
              const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
              if (textChunk) {
                aiText += textChunk
                // Update specific message directly to avoid React state batching issues during fast streams
                setSessions(prev => prev.map(s => {
                  if (s.id === currentSessionId) {
                    const msgs = [...s.messages]
                    const lastIdx = msgs.length - 1
                    if (msgs[lastIdx].id === assistantMessageId) {
                      msgs[lastIdx] = { ...msgs[lastIdx], content: aiText }
                    }
                    return { ...s, messages: msgs }
                  }
                  return s
                }))
              }
            } catch (e) {
              console.error('Error parsing stream chunk', e)
            }
          }
        }
      }
    } catch (error: any) {
      setIsLoading(false)
      updateSessionMessages(currentSessionId, [
        ...newMessages,
        { id: Date.now().toString(), role: 'assistant', content: `❌ Erreur : ${error.message}` }
      ])
    }
  }

  const confirmAction = async (messageId: string, actionName: string, confirm: boolean) => {
    if (!currentSessionId) return;

    let actionSuccess = false
    let errorMessage = ''

    const msg = sessions.find(s => s.id === currentSessionId)?.messages.find(m => m.id === messageId)
    const args = msg?.functionCall?.args || {}

    if (confirm) {
      try {
        if (actionName === 'add_trade') {
          if (!accounts || accounts.length === 0) {
            throw new Error("Vous n'avez aucun compte de trading. Veuillez d'abord créer un compte dans la section 'Comptes'.")
          }
          await createTrade({
            accountId: selectedAccountId || accounts[0].id,
            asset: args.pair,
            direction: args.direction,
            timeframe: args.timeframe || 'M15',
            pnlAmount: Number(args.pnl),
            date: args.date,
            result: Number(args.pnl) >= 0 ? 'GAIN' : 'PERTE',
            createdDateTime: new Date().toISOString()
          } as any)
          actionSuccess = true
        } else if (actionName === 'delete_all_trades') {
          await deleteAllTrades()
          actionSuccess = true
        } else if (actionName === 'sync_mt5') {
          actionSuccess = true
        }
      } catch (e: any) {
        actionSuccess = false
        errorMessage = e.message
      }
    }
      
    // LOGGING DE LA TÉLÉMÉTRIE (PHASE 4)
    // Commenté temporairement car la table ai_logs n'est pas encore créée sur ton Supabase distant (évite l'erreur 404 rouge)
    /*
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('ai_logs').insert({
          user_id: user.id,
          session_id: currentSessionId,
          user_message: confirm ? "Action validée par l'utilisateur" : "Action refusée par l'utilisateur",
          action_executed: actionName,
          action_args: args,
          success: confirm ? actionSuccess : false,
          error_message: errorMessage || null
        })
      }
    } catch (logError) {
      console.error("Erreur lors du logging IA:", logError)
    }
    */

    // Mettre à jour le statut du message
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: s.messages.map(m => m.id === messageId && m.functionCall ? { 
            ...m, 
            functionCall: { ...m.functionCall, status: confirm ? (actionSuccess ? 'executed' : 'cancelled') : 'cancelled' } 
          } : m)
        }
      }
      return s
    }))

    // Résultat à envoyer à Gemini
    const resultText = confirm 
      ? (actionSuccess ? `Action '${actionName}' exécutée avec succès par l'utilisateur.` : `Échec de l'action : ${errorMessage}`)
      : `Action '${actionName}' ANNULÉE par l'utilisateur pour raison de sécurité.`
    
    // Add result to messages and trigger next AI thought
    const fnResponseMsg: Message = {
      id: Date.now().toString(),
      role: 'function',
      content: resultText,
      functionCall: { name: actionName, args: {}, status: confirm ? (actionSuccess ? 'executed' : 'cancelled') : 'cancelled' }
    }
    
    const currentMsgs = sessions.find(s => s.id === currentSessionId)?.messages || []
    updateSessionMessages(currentSessionId, [...currentMsgs, fnResponseMsg])
    
    // We should ideally call handleSend here automatically, but to avoid infinite loops 
    // we'll just add a fake user message to trigger it.
    const nextInput = confirm 
      ? (actionSuccess 
          ? `(Système: L'action a été exécutée avec succès. Confirme brièvement à l'utilisateur.)` 
          : `(Système: L'action a échoué avec l'erreur : "${errorMessage}". Explique brièvement l'erreur à l'utilisateur et propose une solution.)`)
      : `(Système: L'action a été annulée par l'utilisateur. Rassure-le et demande-lui comment tu peux l'aider autrement.)`
      
    setInput(nextInput)
    setTimeout(() => {
      document.getElementById('ai-send-btn')?.click()
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-2xl shadow-violet-500/30 flex items-center justify-center group overflow-hidden border border-white/10"
          >
            <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <MessageCircle size={22} className="relative z-10 fill-white/20 stroke-[1.5]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] max-h-[85vh] flex flex-col bg-card/95 backdrop-blur-3xl border-2 border-violet-500/20 dark:border-violet-500/50 rounded-2xl shadow-2xl dark:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 flex items-center justify-between border-b border-border/50 bg-background/50">
              <div className="flex items-center gap-2">
                {showHistory ? (
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="p-1.5 -ml-1 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowHistory(true)}
                    className="p-1.5 -ml-1 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors relative"
                    title="Historique"
                  >
                    <History size={18} />
                  </button>
                )}
                
                <div className="flex items-center gap-2">
                  <VaynaLogo size={28} className="shadow-lg rounded-[6px]" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      VAYNA Bot
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-500">Pro</span>
                    </h3>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewChat}
                  className="p-1.5 rounded-full text-violet-500 hover:bg-violet-500/10 transition-colors"
                  title="Nouvelle discussion"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-accent/10 dark:bg-[#1E1E2E]/80">
              
              {/* History View */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'tween', duration: 0.2 }}
                    className="absolute inset-0 z-20 bg-card flex flex-col"
                  >
                    <div className="p-3 border-b border-border/50 bg-accent/5">
                      <h3 className="font-semibold text-xs">Historique</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-accent">
                      {sessions.length === 0 ? (
                        <div className="text-center text-muted-foreground text-xs mt-10">
                          Aucune discussion.
                        </div>
                      ) : (
                        sessions.map(session => (
                          <div
                            key={session.id}
                            onClick={() => {
                              setCurrentSessionId(session.id)
                              setShowHistory(false)
                            }}
                            className={cn(
                              "group p-2.5 rounded-lg cursor-pointer border transition-all flex items-center justify-between",
                              currentSessionId === session.id
                                ? "bg-violet-500/10 border-violet-500/30"
                                : "bg-background border-border/50 hover:border-violet-500/30 hover:bg-accent/50"
                            )}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <MessageSquare size={14} className={currentSessionId === session.id ? "text-violet-500" : "text-muted-foreground"} />
                              <div className="truncate text-xs font-medium text-foreground">
                                {session.title}
                                <div className="text-[9px] text-muted-foreground font-normal mt-0.5">
                                  {new Date(session.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDeleteSession(e, session.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat View */}
              <div className="absolute inset-0 flex flex-col h-full">
                {!apiKey && (
                  <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 flex items-start gap-2 text-amber-600 dark:text-amber-400">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed">
                      <strong>Clé API requise :</strong> Ajoutez `VITE_GEMINI_API_KEY=votre_cle` dans `.env`.
                    </p>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin scrollbar-thumb-border/80 scrollbar-track-transparent">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={idx === messages.length - 1 ? { opacity: 0, y: 10 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex group relative",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === 'user' && editingMessageId === msg.id ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <textarea 
                            value={editInput}
                            onChange={(e) => setEditInput(e.target.value)}
                            className="text-xs p-2 rounded-md bg-background border border-border text-foreground min-h-[60px] resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setEditingMessageId(null)} className="text-[10px] text-muted-foreground hover:text-foreground">Annuler</button>
                            <button onClick={() => { setEditingMessageId(null); handleSend(editInput, msg.id) }} className="bg-violet-600 text-white text-[10px] px-2 py-1 rounded shadow-sm hover:bg-violet-700">Enregistrer</button>
                          </div>
                        </div>
                      ) : (
                        <div className={cn(
                          "p-3 rounded-xl text-[12px] leading-relaxed relative shadow-sm max-w-[85%]",
                          msg.role === 'user'
                            ? "bg-violet-600 text-white rounded-tr-sm"
                            : "bg-card/90 dark:bg-[#2A2A3C] text-foreground rounded-tl-sm border border-border/50 dark:border-white/5 shadow-sm"
                        )}>
                          {msg.role === 'assistant' && (
                            <div className="absolute -top-1.5 -left-1.5 w-5 h-5 shadow-sm border-[1.5px] border-background rounded-[6px] overflow-hidden bg-black flex items-center justify-center">
                              <VaynaLogo size={20} />
                            </div>
                          )}
                          
                          {msg.role === 'user' && msg.id !== editingMessageId && (
                            <button 
                              onClick={() => { setEditingMessageId(msg.id); setEditInput(msg.content.replace(/\[En réponse à : ".*"\]\n\n/, '')) }} 
                              className="absolute top-1 -left-9 p-1.5 opacity-80 hover:opacity-100 transition-all bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 rounded-full shadow-sm hover:scale-110 z-10"
                              title="Modifier ce message"
                            >
                              <Pencil size={12} />
                            </button>
                          )}
                          {msg.role === 'assistant' && (
                            <button 
                              onClick={() => setReplyingToMessageId(msg.id)} 
                              className="absolute top-1 -right-9 p-1.5 opacity-80 hover:opacity-100 transition-all bg-white dark:bg-[#2A2A3C] border border-border text-foreground rounded-full shadow-sm hover:scale-110 z-10"
                              title="Répondre à ce message"
                            >
                              <Reply size={12} />
                            </button>
                          )}
                          <ReactMarkdown
                            components={{
                              ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2 space-y-1.5 text-muted-foreground" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-2 space-y-1.5 text-muted-foreground marker:text-violet-500 marker:font-bold" {...props} />,
                              li: ({node, ...props}) => <li className="leading-relaxed pl-1" {...props} />,
                              p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed break-words" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-violet-700 dark:text-violet-400 bg-violet-500/10 px-1 py-0.5 rounded-sm" {...props} />,
                              h1: ({node, ...props}) => <h1 className="text-base font-bold mt-3 mb-1.5" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-sm font-bold mt-2 mb-1.5" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-[13px] font-bold mt-2 mb-1" {...props} />,
                              a: ({node, href, children, ...props}) => {
                                if (href?.startsWith('/app/')) {
                                  return (
                                    <button 
                                      onClick={() => {
                                        navigate(href)
                                        setIsOpen(false)
                                      }}
                                      className="inline-flex items-center gap-1.5 mt-2 mb-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
                                    >
                                      {children}
                                      <ChevronRight size={14} />
                                    </button>
                                  )
                                }
                                return <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline font-medium" {...props}>{children}</a>
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                        {msg.functionCall && (
                          <div className="mt-2 bg-background/60 border border-violet-500/20 rounded-lg p-2.5 shadow-inner">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5 text-violet-500 font-bold text-[10px] uppercase tracking-wider">
                                <AlertCircle size={12} />
                                Autorisation Requise
                              </div>
                              <span className="text-[10px] font-mono text-muted-foreground bg-accent/50 px-1.5 py-0.5 rounded">{msg.functionCall.name}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mb-2 leading-snug">
                              {msg.functionCall.name === 'sync_mt5' && 'Synchronisation MT5 manuelle.'}
                              {msg.functionCall.name === 'delete_all_trades' && <span className="text-destructive font-bold">⚠️ Suppression TOTALE des trades. Irréversible !</span>}
                              {msg.functionCall.name === 'add_trade' && (
                                <span>
                                  Ajouter : <strong className="text-foreground">{msg.functionCall.args.direction} {msg.functionCall.args.pair}</strong> · PnL <strong className={Number(msg.functionCall.args.pnl) >= 0 ? 'text-green-500' : 'text-red-500'}>{msg.functionCall.args.pnl}$</strong>
                                </span>
                              )}
                            </p>
                            
                            {msg.functionCall.status === 'pending' ? (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => confirmAction(msg.id, msg.functionCall!.name, false)}
                                  className="flex-1 py-1.5 px-2 rounded-md border border-border/70 bg-card text-foreground text-[11px] hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-colors font-semibold"
                                >
                                  ✕ Annuler
                                </button>
                                <button 
                                  onClick={() => confirmAction(msg.id, msg.functionCall!.name, true)}
                                  className="flex-1 py-1.5 px-2 rounded-md bg-violet-600 hover:bg-violet-700 text-white text-[11px] shadow-sm transition-colors font-semibold"
                                >
                                  ✓ Autoriser
                                </button>
                              </div>
                            ) : (
                              <div className={cn(
                                "py-1 px-3 rounded-md text-center text-[10px] font-bold uppercase tracking-wider",
                                msg.functionCall.status === 'executed' ? "bg-green-500/15 text-green-500" : "bg-destructive/15 text-destructive"
                              )}>
                                {msg.functionCall.status === 'executed' ? '✓ Exécuté' : '✕ Annulé'}
                              </div>
                            )}
                          </div>
                        )}
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex max-w-[85%] mr-auto"
                    >
                      <div className="p-3 rounded-xl rounded-tl-sm bg-card border border-border shadow-sm flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-violet-500" />
                        <span className="text-[11px] text-muted-foreground font-medium">L'Agent réfléchit...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-border/50 bg-background/50 backdrop-blur-md flex flex-col gap-2">
                  {replyingToMessageId && (
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-accent/40 px-3 py-2 rounded-lg border border-border/50 shadow-inner">
                      <div className="flex items-center gap-2 truncate">
                        <CornerDownRight size={12} className="text-violet-500 shrink-0" />
                        <span className="truncate font-medium">
                          En réponse à : "{messages.find(m => m.id === replyingToMessageId)?.content.replace(/\[En réponse à : ".*"\]\n\n/, '').substring(0, 40)}..."
                        </span>
                      </div>
                      <button onClick={() => setReplyingToMessageId(null)} className="hover:text-foreground shrink-0 p-1 bg-background/50 rounded-full">
                        <X size={10} />
                      </button>
                    </div>
                  )}
                  <div className="relative flex items-end gap-2 bg-accent/30 border border-border rounded-xl p-1.5 transition-all focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500/50">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Poser une question ou demander une action..."
                      className="flex-1 bg-transparent border-none pl-2 py-1.5 text-xs focus:outline-none focus:ring-0 resize-none max-h-[100px] min-h-[36px] scrollbar-thin text-foreground"
                      rows={1}
                      style={{ height: 'auto' }}
                    />
                    <button
                      id="ai-send-btn"
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-white bg-gradient-to-r from-violet-600 to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                    >
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="ml-0.5" />}
                    </button>
                  </div>
                  <div className="flex justify-center items-center mt-2 px-1">
                    <p className="text-[9px] text-muted-foreground/80">
                      VAYNA IA peut faire des erreurs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
