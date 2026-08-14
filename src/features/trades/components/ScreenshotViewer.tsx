import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Plus, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDatabase } from '@/hooks/useDatabase'
import type { Trade } from '@/types'

interface ScreenshotViewerProps {
  trade: Trade | null
  onClose: () => void
}

export function ScreenshotViewer({ trade, onClose }: ScreenshotViewerProps) {
  const { getScreenshots, saveScreenshot, deleteScreenshot, selectImage } = useDatabase()
  
  const [screenshots, setScreenshots] = useState<any[]>([])
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [deletingScreenshot, setDeletingScreenshot] = useState<number | null>(null)
  
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Fetch screenshots when trade changes
  useEffect(() => {
    if (trade) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      setCurrentScreenshotIndex(0)
      
      const fetchScreenshots = async () => {
        try {
          const tradeScreenshots = await getScreenshots(trade.id)
          setScreenshots(tradeScreenshots)
        } catch (err) {
          console.log('Could not load screenshots (table may not exist)')
          setScreenshots([])
        }
      }
      fetchScreenshots()
    } else {
      setScreenshots([])
    }
  }, [trade, getScreenshots])

  // Reset zoom when changing images
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [currentScreenshotIndex])

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(1, Math.min(5, zoom * delta))
    setZoom(newZoom)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || zoom <= 1) return
    const container = imageContainerRef.current
    if (!container) return

    const maxPanX = (container.scrollWidth * zoom - container.clientWidth) / 2
    const maxPanY = (container.scrollHeight * zoom - container.clientHeight) / 2

    let newX = e.clientX - dragStart.x
    let newY = e.clientY - dragStart.y

    newX = Math.max(-maxPanX, Math.min(maxPanX, newX))
    newY = Math.max(-maxPanY, Math.min(maxPanY, newY))

    setPan({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleImageUpload = async () => {
    const image = await selectImage()
    if (image && trade) {
      try {
        await saveScreenshot(trade.id, image.data)
        const updatedScreenshots = await getScreenshots(trade.id)
        setScreenshots(updatedScreenshots)
      } catch (err) {
        console.log('Could not update screenshots')
      }
    }
  }

  const handleDeleteScreenshot = async () => {
    if (deletingScreenshot === null || !screenshots[deletingScreenshot]) return

    try {
      await deleteScreenshot(screenshots[deletingScreenshot].id)
      const newScreenshots = screenshots.filter((_, i) => i !== deletingScreenshot)
      setScreenshots(newScreenshots)

      if (currentScreenshotIndex >= newScreenshots.length && newScreenshots.length > 0) {
        setCurrentScreenshotIndex(newScreenshots.length - 1)
      } else if (newScreenshots.length === 0) {
        setCurrentScreenshotIndex(0)
      }
      setDeletingScreenshot(null)
    } catch (error) {
      console.error('Error deleting screenshot:', error)
    }
  }

  return (
    <Dialog open={!!trade} onOpenChange={(open) => {
      if (!open) onClose()
    }}>
      <DialogContent className="w-full h-[calc(100vh-80px)] max-w-full sm:max-w-[1200px] lg:max-w-[1400px] flex flex-col p-0 border-0 bg-gradient-to-b from-background to-muted/20">
        <DialogDescription className="sr-only">Visualiser les screenshots du trade</DialogDescription>
        <DialogHeader className="border-b px-6 pt-4 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold"
            >
              Screenshots - {trade?.asset} ({screenshots.length > 0 ? currentScreenshotIndex + 1 : 0}/{screenshots.length})
            </motion.span>
            <div className="flex gap-2">
              {screenshots.length > 0 && (
                <Button
                  onClick={() => setDeletingScreenshot(currentScreenshotIndex)}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              )}
              <Button onClick={handleImageUpload} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden px-6 py-4">
          {screenshots.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col gap-4"
            >
              <motion.div
                ref={imageContainerRef}
                className="relative flex-1 bg-muted rounded-lg overflow-hidden cursor-grab active:cursor-grabbing shadow-xl"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ userSelect: 'none' }}
              >
                <div
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                    transition: isDragging ? 'none' : 'transform 0.1s',
                    cursor: zoom > 1 ? 'grab' : 'default'
                  }}
                  className="w-full h-full"
                >
                  <img
                    src={`data:image/png;base64,${screenshots[currentScreenshotIndex]?.image_data}`}
                    alt={`Screenshot ${currentScreenshotIndex + 1}`}
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>

                {zoom > 1 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded text-xs">
                    {Math.round(zoom * 100)}%
                  </div>
                )}

                {screenshots.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentScreenshotIndex(i => Math.max(0, i - 1))}
                      disabled={currentScreenshotIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white disabled:opacity-30"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setCurrentScreenshotIndex(i => Math.min(screenshots.length - 1, i + 1))}
                      disabled={currentScreenshotIndex === screenshots.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white disabled:opacity-30"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </motion.div>
              <motion.div
                className="flex justify-center gap-2 pb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {screenshots.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentScreenshotIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentScreenshotIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p>Aucun screenshot pour ce trade</p>
              <Button variant="outline" className="mt-4 gap-2" onClick={handleImageUpload}>
                <Plus className="h-4 w-4" />
                Ajouter une image
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      {deletingScreenshot !== null && (
        <Dialog open={true} onOpenChange={() => setDeletingScreenshot(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Supprimer le screenshot</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce screenshot ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setDeletingScreenshot(null)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteScreenshot}>
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
