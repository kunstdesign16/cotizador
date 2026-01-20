'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteAllProductsBySupplier } from '@/actions/products'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface DeletePriceListButtonProps {
    supplierId: string
    className?: string
}

export function DeletePriceListButton({ supplierId, className }: DeletePriceListButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que quieres borrar TODA la lista de precios de este proveedor? Esta acción eliminará todos los productos registrados y no se puede deshacer.')) return

        setLoading(true)
        try {
            const res = await deleteAllProductsBySupplier(supplierId)
            if (res.success) {
                toast.success('Lista de precios eliminada correctamente')
                router.refresh()
            } else {
                toast.error(res.error || 'Error al eliminar la lista de precios')
            }
        } catch (_error) {
            toast.error('Ocurrió un error inesperado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className={cn(
                "gap-2 border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-colors font-bold",
                className
            )}
        >
            <Trash2 className="h-4 w-4" />
            {loading ? 'Borrando...' : 'BORRAR TODO EL CATÁLOGO'}
        </Button>
    )
}
