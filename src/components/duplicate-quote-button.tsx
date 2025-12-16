'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { duplicateQuote } from '@/actions/quotes'
import { cn } from '@/lib/utils'

interface DuplicateQuoteButtonProps {
    id: string
    iconOnly?: boolean
    className?: string
}

export default function DuplicateQuoteButton({ id, iconOnly = false, className }: DuplicateQuoteButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDuplicate = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setLoading(true)
        const res = await duplicateQuote(id)
        if (res.success && res.id) {
            // Redirect to the new quote
            router.push(`/quotes/${res.id}`)
        } else {
            alert('Error al duplicar el proyecto')
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            onClick={handleDuplicate}
            disabled={loading}
            size={iconOnly ? "icon" : "default"}
            className={cn("text-blue-500 hover:text-blue-600 hover:bg-blue-50", className)}
            title="Duplicar Proyecto"
        >
            <Copy className={cn("h-4 w-4", !iconOnly && "mr-2")} />
            {!iconOnly && "Duplicar"}
        </Button>
    )
}
