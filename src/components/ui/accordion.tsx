import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple Accordion implementation
type AccordionContextType = {
  value?: string
  type: "single" | "multiple"
}

const AccordionContext = React.createContext<AccordionContextType>({
  type: "single",
})

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple"
  collapsible?: boolean
  value?: string
  onValueChange?: (value: string) => void
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      className,
      type = "single",
      collapsible = true,
      value,
      onValueChange,
      children,
      ...props
    },
    ref
  ) => {
    const [openItems, setOpenItems] = React.useState<Set<string>>(
      value ? new Set([value]) : new Set()
    )

    const handleValueChange = (itemValue: string) => {
      setOpenItems((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(itemValue)) {
          newSet.delete(itemValue)
        } else {
          if (type === "single") {
            newSet.clear()
          }
          newSet.add(itemValue)
        }
        return newSet
      })
      onValueChange?.(itemValue)
    }

    return (
      <AccordionContext.Provider value={{ value: Array.from(openItems)[0], type }}>
        <div
          ref={ref}
          className={cn("space-y-2", className)}
          data-state={openItems.size > 0 ? "open" : "closed"}
          {...props}
        >
          {React.Children.map(children, (child) =>
            React.cloneElement(child as React.ReactElement, {
              openItems,
              onOpenChange: handleValueChange,
            } as any)
          )}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  openItems?: Set<string>
  onOpenChange?: (value: string) => void
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, openItems, onOpenChange, children, ...props }, ref) => {
    const isOpen = openItems?.has(value) ?? false

    return (
      <div
        ref={ref}
        className={cn("", className)}
        data-state={isOpen ? "open" : "closed"}
        data-value={value}
        {...props}
      >
        {React.Children.map(children, (child) =>
          React.cloneElement(child as React.ReactElement, {
            isOpen,
            value,
            onOpenChange,
          } as any)
        )}
      </div>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean
  value?: string
  onOpenChange?: (value: string) => void
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, isOpen, value, onOpenChange, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between py-3 px-4 text-left font-medium transition-all [&svg]:transition-transform [&svg]:duration-200 hover:bg-muted/50",
        className
      )}
      onClick={() => value && onOpenChange?.(value)}
      aria-expanded={isOpen}
      {...props}
    >
      <span className="flex-1">{children}</span>
      <ChevronDown
        className={cn("h-4 w-4 transition-transform duration-200 flex-shrink-0", {
          "rotate-180": isOpen,
        })}
      />
    </button>
  )
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, isOpen, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden px-4 pb-4 text-sm text-muted-foreground transition-all duration-200",
        isOpen ? "max-h-96" : "max-h-0",
        className
      )}
      {...props}
    />
  )
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

