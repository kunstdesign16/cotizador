'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
    label?: string
    variant?: "default" | "outline" | "ghost"
    className?: string
    fallbackUrl?: string
}

export function BackButton({
    label = "Regresar",
    variant = "ghost",
    className,
    fallbackUrl
}: BackButtonProps) {
    const router = useRouter()

    const handleBack = () => {
        // If we have history, go back. Otherwise go to fallback or dashboard.
        if (window.history.length > 1) {
            router.back()
        } else {
            router.push(fallbackUrl || '/dashboard')
        }
    }

    return (
        <Button
            variant={variant}
            className={cn("gap-2", className)}
            onClick={handleBack}
        >
            <ArrowLeft className="h-4 w-4" />
            {label}
        </Button>
    )
}
