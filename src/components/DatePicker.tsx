import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  // Gérer les dates invalides
  const getValidDate = (dateStr: string) => {
    try {
      if (!dateStr) return new Date()
      const parsed = new Date(dateStr)
      if (isNaN(parsed.getTime())) return new Date()
      return parsed
    } catch {
      return new Date()
    }
  }
  
  const [currentDate, setCurrentDate] = useState(getValidDate(value))

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleSelectDay = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    // Formater la date EN IGNORANT le fuseau horaire local (pas toISOString())
    const year = selected.getFullYear()
    const month = String(selected.getMonth() + 1).padStart(2, '0')
    const dayStr = String(selected.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${dayStr}`
    onChange(dateString)
    setIsOpen(false)
  }

  const days: (number | null)[] = []
  const firstDay = getFirstDayOfMonth(currentDate)
  const daysInMonth = getDaysInMonth(currentDate)

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return 'Sélectionner une date'
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 text-left cursor-pointer hover:bg-accent hover:border-primary flex items-center gap-2"
      >
        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="flex-1">{formatDisplay(value)}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-background border border-input rounded-lg shadow-lg p-3">
          <div className="w-64">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-accent rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-accent rounded"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0.5 mb-2">
              {days.map((day, idx) => {
                let isSelected = false
                try {
                  if (day && value) {
                    const selectedDate = new Date(value)
                    if (!isNaN(selectedDate.getTime())) {
                      isSelected =
                        selectedDate.getDate() === day &&
                        selectedDate.getMonth() === currentDate.getMonth() &&
                        selectedDate.getFullYear() === currentDate.getFullYear()
                    }
                  }
                } catch {
                  isSelected = false
                }

                return (
                  <button
                    key={idx}
                    onClick={() => day && handleSelectDay(day)}
                    disabled={!day}
                    className={`py-1 text-xs rounded transition-colors ${
                      !day
                        ? 'text-muted-foreground opacity-50'
                        : isSelected
                        ? 'bg-primary text-primary-foreground font-semibold hover:bg-primary/90'
                        : 'hover:bg-accent cursor-pointer text-foreground'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Today Button */}
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0]
                onChange(today)
                setCurrentDate(new Date(today))
                setIsOpen(false)
              }}
              className="w-full py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
            >
              Aujourd'hui
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
