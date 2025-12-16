'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, ShoppingCart } from 'lucide-react'
import { createSupplierOrder } from '@/actions/supplier-orders'
import { useRouter } from 'next/navigation'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Product {
    id: string
    code: string
    name: string
}

interface SupplierOrderFormProps {
    supplierId: string
    products: Product[]
    children?: React.ReactNode
}

interface OrderItem {
    code: string
    name: string
    quantity: number
    unitCost?: number
}

export function SupplierOrderForm({ supplierId, products, children }: SupplierOrderFormProps) {
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState<OrderItem[]>([])
    const [selectedProduct, setSelectedProduct] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [expectedDate, setExpectedDate] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleAddItem = () => {
        if (!selectedProduct) return
        const product = products.find(p => p.code === selectedProduct)
        if (!product) return

        const existingItem = items.find(i => i.code === product.code)
        if (existingItem) {
            setItems(items.map(i => i.code === product.code ? { ...i, quantity: i.quantity + quantity } : i))
        } else {
            // Initialize with current product price if available (assuming price in product is sell price, maybe we don't have cost)
            // For now, init at 0 or empty
            setItems([...items, { code: product.code, name: product.name, quantity, unitCost: 0 }])
        }
        setSelectedProduct('')
        setQuantity(1)
    }

    const handleUpdateCost = (code: string, cost: number) => {
        setItems(items.map(i => i.code === code ? { ...i, unitCost: cost } : i))
    }

    const handleRemoveItem = (code: string) => {
        setItems(items.filter(i => i.code !== code))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (items.length === 0) return

        setLoading(true)
        try {
            const date = expectedDate ? new Date(expectedDate + 'T12:00:00') : undefined
            const result = await createSupplierOrder(supplierId, items, date)

            if (result.success) {
                setOpen(false)
                setItems([])
                setExpectedDate('')
                router.refresh()
            } else {
                alert(result.error)
            }
        } catch (error) {
            alert('Error al crear orden')
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
                    <div className="bg-background rounded-xl border shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" /> Nueva Orden de Compra
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {/* Add Item Section */}
                            <div className="flex gap-2 items-end bg-muted/30 p-4 rounded-lg">
                                <div className="flex-1">
                                    <label className="text-sm font-medium">Producto</label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                    >
                                        <option value="">Seleccionar producto...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.code}>{p.code} - {p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="text-sm font-medium">Cant.</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                    />
                                </div>
                                <Button onClick={handleAddItem} disabled={!selectedProduct}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Items Table */}
                            <div className="border rounded-md overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted text-muted-foreground font-medium">
                                        <tr className="border-b">
                                            <th className="h-10 px-4 text-left font-medium">Código</th>
                                            <th className="h-10 px-4 text-left font-medium">Descripción</th>
                                            <th className="h-10 px-4 text-right font-medium w-24">Cant.</th>
                                            <th className="h-10 px-4 text-right font-medium w-32">Costo Unit.</th>
                                            <th className="h-10 px-4 text-right font-medium w-32">Total</th>
                                            <th className="h-10 px-4 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {items.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                    No hay productos agregados a la orden
                                                </td>
                                            </tr>
                                        ) : (
                                            items.map((item, index) => (
                                                <tr key={item.code} className="hover:bg-muted/50">
                                                    <td className="p-4 font-mono text-xs">{item.code}</td>
                                                    <td className="p-4">{item.name}</td>
                                                    <td className="p-4 text-right">{item.quantity}</td>
                                                    <td className="p-4">
                                                        <Input
                                                            type="number"
                                                            className="text-right h-8"
                                                            placeholder="0.00"
                                                            value={item.unitCost || ''}
                                                            onChange={(e) => handleUpdateCost(item.code, Number(e.target.value))}
                                                        />
                                                    </td>
                                                    <td className="p-4 text-right font-medium">
                                                        ${((item.quantity * (item.unitCost || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 }))}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemoveItem(item.code)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {items.length > 0 && (
                                        <tfoot className="bg-muted/50 font-medium">
                                            <tr>
                                                <td colSpan={4} className="p-4 text-right">Total Estimado:</td>
                                                <td className="p-4 text-right">
                                                    ${items.reduce((acc, item) => acc + (item.quantity * (item.unitCost || 0)), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>

                            {/* Date & Submit */}
                            <form onSubmit={handleSubmit} className="flex items-end justify-between gap-4 pt-4 border-t">
                                <div>
                                    <label className="text-sm font-medium block mb-1">Fecha Esperada (Opcional)</label>
                                    <Input
                                        type="date"
                                        value={expectedDate}
                                        onChange={(e) => setExpectedDate(e.target.value)}
                                        className="w-48"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={loading || items.length === 0}>
                                        {loading ? 'Creando...' : 'Crear Orden'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
