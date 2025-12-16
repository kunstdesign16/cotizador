'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteClient } from '@/actions/clients'
import { cn } from '@/lib/utils'

interface DeleteClientButtonProps {
    id: string
    iconOnly?: boolean
    className?: string
}

export default function DeleteClientButton({ id, iconOnly = false, className }: DeleteClientButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!confirm('¿Estás seguro de que quieres eliminar este cliente? Se eliminarán también todos sus proyectos y cotizaciones.')) return

        setLoading(true)
        const res = await deleteClient(id)
        if (res.success) {
            router.refresh()
        } else {
            alert('Error al eliminar el cliente')
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={loading}
            size={iconOnly ? "icon" : "sm"}
            className={cn("text-red-500 hover:text-red-600 hover:bg-red-50", className)}
            title="Eliminar Cliente"
        >
            <Trash2 className={cn("h-4 w-4", !iconOnly && "mr-2")} />
            {!iconOnly && "Eliminar"}
        </Button>
    )
}
