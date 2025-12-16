'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'
import { createSupplier, updateSupplier } from '@/actions/suppliers'
import { useRouter } from 'next/navigation'

interface SupplierFormDialogProps {
    supplier?: { id: string, name: string, type: string }
    children?: React.ReactNode
}

export function SupplierFormDialog({ supplier, children }: SupplierFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(supplier?.name || '')
    const [type, setType] = useState(supplier?.type || 'RAW_MATERIAL')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        try {
            const result = supplier
                ? await updateSupplier(supplier.id, name, type)
                : await createSupplier(name, type)

            if (result.success) {
                setOpen(false)
                setName('')
                router.refresh()
            } else {
                alert(result.error || 'Error')
            }
        } catch (error) {
            console.error(error)
            alert('Error inesperado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {children}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-background rounded-xl border shadow-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                                {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Nombre del Proveedor</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej. LP Mexico"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Tipo de Proveedor</label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="RAW_MATERIAL">Materia Prima</option>
                                    <option value="SERVICE">Servicio / Personalización</option>
                                    <option value="FINISHED_PRODUCT">Producto Terminado</option>
                                </select>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
