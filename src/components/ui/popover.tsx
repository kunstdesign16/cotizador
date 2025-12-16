"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const PopoverContext = React.createContext<{
    open: boolean
    onOpenChange: (open: boolean) => void
}>({
    open: false,
    onOpenChange: () => { },
})

const Popover = ({
    children,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
    const open = controlledOpen ?? uncontrolledOpen
    const onOpenChange = setControlledOpen ?? setUncontrolledOpen

    return (
        <PopoverContext.Provider value={{ open, onOpenChange }}>
            <div className="relative inline-block">{children}</div>
        </PopoverContext.Provider>
    )
}

const PopoverTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, onClick, children, asChild, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(PopoverContext)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        onOpenChange(!open)
    }

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: handleClick,
            ref,
            ...props
        })
    }

    return (
        <button
            ref={ref}
            onClick={handleClick}
            className={className}
            {...props}
        >
            {children}
        </button>
    )
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }
>(({ className, align = "center", style, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(PopoverContext)
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                // Check if click was on trigger (handled by trigger's toggle) is tricky without refs sharing
                // Simple heuristic: if open, close. But we need to avoid immediate close if clicking trigger.
                // For this simple implementation, we rely on the fact that if we click outside content, we likely want to close.
                // Triggers often stopPropagation. 
                onOpenChange(false)
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [open, onOpenChange])

    if (!open) return null

    return (
        <div
            ref={(node) => {
                // Merge refs
                contentRef.current = node
                if (typeof ref === 'function') ref(node)
                else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
            }}
            className={cn(
                "absolute z-50 mt-2 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 bg-white dark:bg-slate-950",
                align === "start" && "left-0",
                align === "center" && "left-1/2 -translate-x-1/2",
                align === "end" && "right-0",
                className
            )}
            style={style}
            {...props}
        />
    )
})
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
