'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteQuote } from '@/actions/quotes'
import { cn } from '@/lib/utils'

interface DeleteQuoteButtonProps {
    id: string
    iconOnly?: boolean
    className?: string
}

export default function DeleteQuoteButton({ id, iconOnly = false, className }: DeleteQuoteButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) return

        setLoading(true)
        const res = await deleteQuote(id)
        if (res.success) {
            router.refresh() // Just refresh, don't push if already on dashboard
        } else {
            alert('Error al eliminar el proyecto')
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={loading}
            size={iconOnly ? "icon" : "default"}
            className={cn("text-red-500 hover:text-red-600 hover:bg-red-50", className)}
        >
            <Trash2 className={cn("h-4 w-4", !iconOnly && "mr-2")} />
            {!iconOnly && "Eliminar"}
        </Button>
    )
}
