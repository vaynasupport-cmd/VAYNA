import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hover?: boolean; glow?: boolean }
>(({ className, hover = false, glow = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-sm",
      "dark:backdrop-blur-xl dark:bg-card/85", /* Subtle glassmorphism in dark mode */
      "relative group transition-all duration-300",
      "before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 before:pointer-events-none",
      "before:shadow-[0_0_0_1px_rgba(59,130,246,0.0)] hover:before:opacity-100",
      "hover:shadow-[0_8px_32px_rgba(59,130,246,0.12),_0_0_0_1px_rgba(59,130,246,0.12)]",
      "dark:hover:shadow-[0_8px_32px_rgba(71,114,250,0.15),_0_0_0_1px_rgba(71,114,250,0.2)]", /* Premium hover shadow in dark mode */
      "hover:border-primary/25 dark:hover:border-primary/30",
      hover && "hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(59,130,246,0.18),_0_0_0_1px_rgba(59,130,246,0.2)] dark:hover:shadow-[0_16px_48px_rgba(71,114,250,0.25)]",
      glow && "shadow-[0_0_24px_rgba(59,130,246,0.15)] border-primary/20 dark:shadow-[0_0_24px_rgba(71,114,250,0.2)]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
