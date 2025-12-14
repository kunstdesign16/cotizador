'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'
import { createProduct, updateProduct } from '@/actions/products'
import { useRouter } from 'next/navigation'

interface ProductFormDialogProps {
    supplierId: string
    product?: { id: string, code: string, name: string, category: string | null, price: number }
    children?: React.ReactNode
}

export function ProductFormDialog({ supplierId, product, children }: ProductFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        code: product?.code || '',
        name: product?.name || '',
        category: product?.category || '',
        price: product?.price || 0
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.code.trim() || !formData.name.trim()) return

        setLoading(true)
        try {
            const result = product
                ? await updateProduct(product.id, formData)
                : await createProduct(supplierId, formData)

            if (result.success) {
                setOpen(false)
                setFormData({ code: '', name: '', category: '', price: 0 })
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
                                {product ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Código</label>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="SKU o código"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Nombre</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Descripción del producto"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Categoría (Opcional)</label>
                                <Input
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="Ej. Artículos de oficina"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Precio</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                    required
                                />
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
