import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Activity,
  Brain,
  AlertCircle,
  Zap,
  Loader2,
  Minus,
  Eye,
  Target,
  FileText,
  BarChart,
  Shield,
  ChevronRight,
  Crosshair
} from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { useDatabase } from '@/hooks/useDatabase'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn, formatDate } from '@/lib/utils'
import type { JournalEntry } from '@/types'

const mentalStates = [
  { value: 'optimal', label: 'État de Flow / Optimal', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { value: 'bon', label: 'Clair & Concentré', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { value: 'neutre', label: 'Neutre / Mécanique', icon: Minus, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
  { value: 'fatigue', label: 'Biais Cognitif / Fatigue', icon: Brain, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { value: 'tilt', label: 'Tilt / Perte de Contrôle', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
]

const getMentalStateVisuals = (state: string) => {
  const normalized = state.toLowerCase();
  if (['optimal', 'excellent'].includes(normalized)) return mentalStates[0];
  if (['bon'].includes(normalized)) return mentalStates[1];
  if (['neutre'].includes(normalized)) return mentalStates[2];
  if (['fatigue', 'mauvais'].includes(normalized)) return mentalStates[3];
  if (['tilt', 'terrible'].includes(normalized)) return mentalStates[4];
  return mentalStates[2]; // Default fallback
}

const marketConditions = [
  'Tendance Haussière (Bullish)',
  'Tendance Baissière (Bearish)',
  'Range (Consolidation)',
  'Haute Volatilité',
  'Faible Liquidité / Choppy'
]

export function Journal() {
  const journalEntries = useStore(s => s.journalEntries)
  const { createJournalEntry, updateJournalEntry, deleteJournalEntry } = useDatabase()
  const { toast } = useToast()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<JournalEntry | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fitlers
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    mentalState: 'bon',
    disciplineScore: 7,
    focusScore: 7,
    confidence: 5,
    tradingPlans: '',
    setupsIdentified: '',
    lessonsLearned: '',
    marketCondition: '',
    pnlSummary: '',
    nextActions: '',
    references: '',
    tags: [] as string[],
  })

  const resetForm = () => {
    setCurrentStep(1)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      content: '',
      mentalState: 'bon',
      disciplineScore: 7,
      focusScore: 7,
      confidence: 5,
      tradingPlans: '',
      setupsIdentified: '',
      lessonsLearned: '',
      marketCondition: '',
      pnlSummary: '',
      nextActions: '',
      references: '',
      tags: [],
    })
  }

  const handleCreate = async () => {
    if (!formData.content.trim()) {
      toast({ title: 'Erreur', description: 'L\'analyse diagnostique est requise', variant: 'destructive' })
      return
    }
    try {
      setIsLoading(true)
      await createJournalEntry(formData)
      setShowAddDialog(false)
      resetForm()
      toast({ title: 'Succès', description: 'Évaluation psychologique enregistrée.' })
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'enregistrer. ' + (error as Error).message, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingEntry || !formData.content.trim()) return
    try {
      setIsLoading(true)
      await updateJournalEntry(editingEntry.id, formData)
      setEditingEntry(null)
      resetForm()
      setShowAddDialog(false)
      toast({ title: 'Succès', description: 'Dossier d\'évaluation mis à jour.' })
    } catch (error) {
      toast({ title: 'Erreur', description: 'Erreur lors de la mise à jour.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingEntry) return
    try {
      setIsLoading(true)
      await deleteJournalEntry(deletingEntry.id)
      setDeletingEntry(null)
      toast({ title: 'Succès', description: 'Archive supprimée.' })
    } catch (error) {
      toast({ title: 'Erreur', description: 'Erreur de suppression.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (entry: JournalEntry) => {
    setEditingEntry(entry)
    const entryData = entry as any
    setFormData({
      date: entry.date,
      title: entry.title || '',
      content: entry.content,
      mentalState: entry.mentalState || 'bon',
      disciplineScore: entry.disciplineScore || 7,
      focusScore: entry.focusScore || 7,
      confidence: entryData.confidence || 5,
      tradingPlans: entryData.tradingPlans || '',
      setupsIdentified: entryData.setupsIdentified || '',
      lessonsLearned: entryData.lessonsLearned || '',
      marketCondition: entryData.marketCondition || '',
      pnlSummary: entryData.pnlSummary || '',
      nextActions: entryData.nextActions || '',
      references: entryData.references || '',
      tags: Array.isArray(entry.tags) ? entry.tags : [],
    })
    setShowAddDialog(true)
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) setFormData({ ...formData, tags: [...formData.tags, tag] })
  }
  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const filteredEntries = useMemo(() => {
    return journalEntries.filter(entry => {
      const entryDate = new Date(entry.date).getTime()
      if (dateFrom && entryDate < new Date(dateFrom).getTime()) return false
      if (dateTo && entryDate > new Date(dateTo).getTime()) return false
      return true
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [journalEntries, dateFrom, dateTo])

  const stats = useMemo(() => {
    if (filteredEntries.length === 0) return { avgDiscipline: 0, avgFocus: 0, avgConfidence: 0, topState: null }
    let td = 0, tf = 0, tc = 0
    const mentalCounts: Record<string, number> = {}

    filteredEntries.forEach(entry => {
      td += entry.disciplineScore || 0
      tf += entry.focusScore || 0
      tc += (entry as any).confidence || 0
      const ms = entry.mentalState || 'neutre'
      mentalCounts[ms] = (mentalCounts[ms] || 0) + 1
    })

    let topStateKey = 'neutre', maxC = 0
    for (const [k, v] of Object.entries(mentalCounts)) {
      if (v > maxC) { maxC = v; topStateKey = k }
    }

    return {
      avgDiscipline: (td / filteredEntries.length).toFixed(1),
      avgFocus: (tf / filteredEntries.length).toFixed(1),
      avgConfidence: (tc / filteredEntries.length).toFixed(1),
      topState: getMentalStateVisuals(topStateKey)
    }
  }, [filteredEntries])

  // Custom Progress Bar for Institutional Look
  const MetricBar = ({ label, value, icon: Icon, colorClass }: { label: string, value: number, icon: any, colorClass: string }) => (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /> {label}</span>
        <span className="font-mono text-foreground">{value}/10</span>
      </div>
      <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden flex">
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", colorClass)}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10">
      {/* ─── HEADER INSTITUTIONNEL ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-8 bg-blue-500 rounded-full" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Vayna Behavioral Analytics</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            Centre Psychologique
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
            Évaluez vos performances cognitives, votre discipline émotionnelle et vos biais comportementaux pour optimiser votre exécution institutionnelle.
          </p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowAddDialog(true); }}
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 border-0"
        >
          <Plus className="h-4 w-4" />
          Nouvelle Évaluation
        </Button>
      </div>

      {/* ─── METRICS DASHBOARD ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Dominance Émotionnelle */}
        <Card className="col-span-1 md:col-span-1 border-border/40 bg-card/40 backdrop-blur-md overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-5 flex flex-col h-full justify-between relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 block">Dominance Mentale</span>
            {stats.topState ? (
              <div className="flex flex-col gap-3">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stats.topState.bg, stats.topState.border, "border")}>
                  <stats.topState.icon className={cn("h-6 w-6", stats.topState.color)} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{stats.topState.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">État le plus fréquent</p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Données insuffisantes</div>
            )}
          </CardContent>
        </Card>

        {/* Moyennes Globales */}
        <Card className="col-span-1 md:col-span-2 border-border/40 bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-5 block">Indices Comportementaux (Moyennes)</span>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">Discipline</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black font-mono">{stats.avgDiscipline}</span>
                  <span className="text-sm text-muted-foreground mb-1">/10</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-l border-border/50 pl-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Crosshair className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">Focus</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black font-mono">{stats.avgFocus}</span>
                  <span className="text-sm text-muted-foreground mb-1">/10</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-l border-border/50 pl-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">Confiance</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black font-mono">{stats.avgConfidence}</span>
                  <span className="text-sm text-muted-foreground mb-1">/10</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtrage */}
        <Card className="col-span-1 md:col-span-1 border-border/40 bg-card/40 backdrop-blur-md">
          <CardContent className="p-5 flex flex-col h-full justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Filtre Temporel</span>
              <div className="space-y-2">
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 text-xs bg-background/50" />
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 text-xs bg-background/50" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground">{filteredEntries.length} Dossiers</span>
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo('') }} className="text-xs text-blue-500 hover:underline">
                  Réinitialiser
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── LISTE DES DOSSIERS D'ÉVALUATION ─── */}
      <div className="space-y-4 mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4" /> Historique des Évaluations
        </h2>

        <AnimatePresence mode="popLayout">
          {filteredEntries.map((entry, i) => {
            const vs = getMentalStateVisuals(entry.mentalState || 'neutre');
            const Icon = vs.icon;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="group relative bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                  {/* Left Color Bar */}
                  <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", vs.bg)} />

                  <div className="p-5 pl-7 flex flex-col xl:flex-row gap-6 lg:gap-10">

                    {/* Colonne 1: Metadonnées & Contexte */}
                    <div className="w-full xl:w-1/4 shrink-0 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[11px] font-mono text-muted-foreground mb-1 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" /> {formatDate(entry.date)}
                          </div>
                          <h3 className="text-base font-bold text-foreground leading-tight line-clamp-2">
                            {entry.title || `Session du ${formatDate(entry.date)}`}
                          </h3>
                        </div>
                      </div>

                      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-md border w-fit", vs.bg, vs.border)}>
                        <Icon className={cn("h-4 w-4", vs.color)} />
                        <span className={cn("text-xs font-semibold", vs.color)}>{vs.label}</span>
                      </div>

                      {((entry as any).pnlSummary || (entry as any).marketCondition) && (
                        <div className="space-y-2 mt-auto pt-4 border-t border-border/50">
                          {(entry as any).pnlSummary && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">PnL Session:</span>
                              <span className="font-mono font-medium">{(entry as any).pnlSummary}</span>
                            </div>
                          )}
                          {(entry as any).marketCondition && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">Marché:</span>
                              <span className="font-medium text-foreground text-right max-w-[120px] truncate">{(entry as any).marketCondition}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Colonne 2: Scores Psychologiques */}
                    <div className="w-full xl:w-1/5 shrink-0 flex flex-col justify-center gap-4 py-2 xl:border-l xl:border-r border-border/50 xl:px-8">
                      <MetricBar
                        label="Discipline"
                        value={entry.disciplineScore || 0}
                        icon={Target}
                        colorClass={entry.disciplineScore! >= 8 ? "bg-emerald-500" : entry.disciplineScore! >= 5 ? "bg-blue-500" : "bg-red-500"}
                      />
                      <MetricBar
                        label="Focus"
                        value={entry.focusScore || 0}
                        icon={Crosshair}
                        colorClass={entry.focusScore! >= 8 ? "bg-emerald-500" : entry.focusScore! >= 5 ? "bg-blue-500" : "bg-red-500"}
                      />
                      <MetricBar
                        label="Confiance"
                        value={(entry as any).confidence || 0}
                        icon={Zap}
                        colorClass={(entry as any).confidence! >= 8 ? "bg-emerald-500" : (entry as any).confidence! >= 5 ? "bg-blue-500" : "bg-red-500"}
                      />
                    </div>

                    {/* Colonne 3: Analyse Qualititative */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Diagnostic de Session</h4>
                        <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3">
                          {entry.content}
                        </p>
                      </div>

                      {/* Actions & Tags en bas */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {entry.tags && entry.tags.slice(0, 4).map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-secondary/40 text-[10px] font-medium rounded-sm">#{tag}</Badge>
                          ))}
                          {entry.tags && entry.tags.length > 4 && (
                            <Badge variant="secondary" className="bg-secondary/20 text-[10px]">+{entry.tags.length - 4}</Badge>
                          )}
                        </div>

                        {/* Actions Rapides */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => openEditDialog(entry)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeletingEntry(entry)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredEntries.length === 0 && (
          <div className="py-20 text-center border border-dashed border-border/50 rounded-xl bg-card/20">
            <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Aucun dossier psychologique</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              L'analyse comportementale est la clé de la rentabilité à long terme. Commencez à documenter vos sessions.
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="mt-6">
              Initier une Évaluation
            </Button>
          </div>
        )}
      </div>

      {/* ─── MODAL D'ÉVALUATION (DIAGNOSTIC) ─── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-background border-border/60 shadow-2xl">
          <div className="px-6 py-4 border-b border-border/50 bg-card/50 flex justify-between items-center shrink-0">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                {editingEntry ? 'Mise à jour du Dossier' : 'Diagnostic de Fin de Session'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">Audit comportemental et technique</p>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map(step => (
                <div key={step} className={cn("h-1.5 w-8 rounded-full transition-colors", currentStep >= step ? "bg-blue-500" : "bg-secondary")} />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">
                    <BarChart className="h-4 w-4" /> 1. Contexte Opérationnel
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">Date de l'audit</label>
                      <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="bg-secondary/30" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">Intitulé de la session</label>
                      <Input placeholder="Ex: NFP Trading, Consolidation Session..." value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="bg-secondary/30" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-foreground">Conditions du Marché (Environnement)</label>
                    <div className="flex flex-wrap gap-2">
                      {marketConditions.map(cond => (
                        <button
                          key={cond}
                          onClick={() => setFormData({ ...formData, marketCondition: formData.marketCondition === cond ? '' : cond })}
                          className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                            formData.marketCondition === cond ? "bg-blue-500/10 border-blue-500/50 text-blue-500 shadow-sm" : "bg-secondary/20 border-border hover:bg-secondary"
                          )}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">Résultat Net (PnL)</label>
                      <Input placeholder="Ex: +1.5R, +450$, -2%" value={formData.pnlSummary} onChange={e => setFormData({ ...formData, pnlSummary: e.target.value })} className="bg-secondary/30" />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">
                    <Activity className="h-4 w-4" /> 2. Métriques Comportementales
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-foreground">État Cognitif Dominant</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {mentalStates.map(state => {
                        const Icon = state.icon
                        const isSelected = formData.mentalState === state.value
                        return (
                          <button
                            key={state.value}
                            onClick={() => setFormData({ ...formData, mentalState: state.value })}
                            className={cn(
                              "flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2",
                              isSelected ? cn(state.bg, state.border, "shadow-sm scale-[1.02]") : "bg-secondary/20 border-border hover:bg-secondary/40"
                            )}
                          >
                            <Icon className={cn("h-6 w-6", isSelected ? state.color : "text-muted-foreground")} />
                            <span className={cn("text-[10px] font-bold text-center", isSelected ? state.color : "text-muted-foreground")}>{state.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card/50 border border-border/50 rounded-xl p-5">
                    {[
                      { key: 'disciplineScore', label: 'Discipline', icon: Target },
                      { key: 'focusScore', label: 'Acutité (Focus)', icon: Crosshair },
                      { key: 'confidence', label: 'Confiance', icon: Zap }
                    ].map(metric => (
                      <div key={metric.key} className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="flex items-center gap-1.5 text-muted-foreground"><metric.icon className="h-3.5 w-3.5" /> {metric.label}</span>
                          <Badge variant="outline" className="font-mono bg-background">{(formData as any)[metric.key]}/10</Badge>
                        </div>
                        <input
                          type="range" min="1" max="10"
                          value={(formData as any)[metric.key]}
                          onChange={e => setFormData({ ...formData, [metric.key]: parseInt(e.target.value) })}
                          className="w-full accent-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">
                    <FileText className="h-4 w-4" /> 3. Synthèse Qualitative
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Diagnostic Global de la Session <span className="text-destructive">*</span></label>
                    <textarea
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Analyse détaillée: erreurs commises, respect du plan, émotions ressenties pendant les drawdowns..."
                      className="w-full min-h-[120px] rounded-lg border border-input bg-secondary/20 p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">Leçons à retenir</label>
                      <textarea
                        value={formData.lessonsLearned}
                        onChange={e => setFormData({ ...formData, lessonsLearned: e.target.value })}
                        placeholder="Insights clés pour l'amélioration continue."
                        className="w-full min-h-[80px] rounded-lg border border-input bg-secondary/20 p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">Plan d'action correctif</label>
                      <textarea
                        value={formData.nextActions}
                        onChange={e => setFormData({ ...formData, nextActions: e.target.value })}
                        placeholder="Actions concrètes pour la prochaine session."
                        className="w-full min-h-[80px] rounded-lg border border-input bg-secondary/20 p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-foreground">Méta-Tags (Classification)</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} className="gap-1.5 pl-2 pr-1.5 py-0.5 bg-secondary hover:bg-secondary text-foreground">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors"><AlertCircle className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Ajouter un tag et appuyer sur Entrée (ex: FOMO, Revanche, Bonne_Attente...)"
                      className="bg-secondary/30 text-sm h-9"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag((e.target as HTMLInputElement).value.trim())
                            ; (e.target as HTMLInputElement).value = ''
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-6 py-4 border-t border-border/50 bg-card/50 flex justify-between items-center shrink-0">
            <Button variant="ghost" onClick={() => currentStep > 1 ? setCurrentStep(p => p - 1) : setShowAddDialog(false)}>
              {currentStep > 1 ? 'Retour' : 'Annuler'}
            </Button>

            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(p => p + 1)} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                Étape Suivante <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={editingEntry ? handleUpdate : handleCreate} disabled={!formData.content.trim() || isLoading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingEntry ? 'Sauvegarder les modifications' : 'Archiver l\'Évaluation'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingEntry} onOpenChange={() => setDeletingEntry(null)}>
        <AlertDialogContent className="border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive"><AlertCircle className="h-5 w-5" /> Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>Cette évaluation comportementale sera définitivement effacée de la base de données. Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">Confirmer la suppression</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </motion.div>
  )
}
