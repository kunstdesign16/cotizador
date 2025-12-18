'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Supplier {
    id: string
    name: string
}

interface CreateOrderDialogProps {
    suppliers: Supplier[]
    children?: React.ReactNode
}

export function CreateOrderDialog({ suppliers, children }: CreateOrderDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState('')

    const handleCreate = () => {
        if (selectedSupplier) {
            router.push(`/suppliers/${selectedSupplier}?newOrder=true`)
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Nueva Orden
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Orden de Compra</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Seleccionar Proveedor</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                        >
                            <option value="">-- Seleccionar --</option>
                            {suppliers.map(supplier => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        onClick={handleCreate}
                        disabled={!selectedSupplier}
                        className="w-full"
                    >
                        Continuar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
