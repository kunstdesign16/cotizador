"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Copy, Pencil, Trash2 } from 'lucide-react'
import { duplicateSupplierOrder, deleteOrder, updatePaymentStatus } from '@/actions/supplier-orders'
import { useRouter } from 'next/navigation'

interface SupplierOrdersClientProps {
    initialOrders: any[]
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

export function SupplierOrdersClient({ initialOrders }: SupplierOrdersClientProps) {
    const [orders, setOrders] = useState(initialOrders)
    const router = useRouter()

    const calculateTotal = (items: any[]) => {
        return items.reduce((sum, item) => sum + (item.unitCost || 0) * (item.quantity || 0), 0)
    }

    const handleDuplicate = async (orderId: string) => {
        const result = await duplicateSupplierOrder(orderId)
        if (result.success) {
            router.refresh()
        } else {
            alert(result.error || 'Error al duplicar orden')
        }
    }

    const handleDelete = async (orderId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta orden?')) return

        const result = await deleteOrder(orderId)
        if (result.success) {
            setOrders(orders.filter((o: any) => o.id !== orderId))
            router.refresh()
        } else {
            alert(result.error || 'Error al eliminar orden')
        }
    }

    const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
        // Optimistic update
        setOrders(orders.map((o: any) =>
            o.id === orderId ? { ...o, paymentStatus: newStatus } : o
        ))

        const result = await updatePaymentStatus(orderId, newStatus)
        if (!result.success) {
            // Revert on error
            router.refresh()
            alert(result.error || 'Error al actualizar estatus de pago')
        }
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Ordenes de Compra</h1>
                        <p className="text-muted-foreground">Historial completo de pedidos a proveedores</p>
                    </div>
                </header>

                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted border-b">
                                <tr>
                                    <th className="py-3 px-4 text-left font-medium">Fecha</th>
                                    <th className="py-3 px-4 text-left font-medium">Proveedor</th>
                                    <th className="py-3 px-4 text-left font-medium">Estado</th>
                                    <th className="py-3 px-4 text-left font-medium">Pago</th>
                                    <th className="py-3 px-4 text-right font-medium">Total</th>
                                    <th className="py-3 px-4 text-center font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            No hay ordenes registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order: any) => {
                                        // Handle both object and string formats (Prisma Json vs serialized)
                                        const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items as any[] || [])
                                        const total = calculateTotal(Array.isArray(items) ? items : [])

                                        return (
                                            <tr key={order.id} className="hover:bg-muted/50">
                                                <td className="py-3 px-4">
                                                    {new Date(order.createdAt).toLocaleDateString('es-MX')}
                                                </td>
                                                <td className="py-3 px-4 font-medium">
                                                    <Link href={`/suppliers/${order.supplierId}`} className="hover:underline">
                                                        {order.supplier.name}
                                                    </Link>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                        order.status === 'ORDERED' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                            order.status === 'RECEIVED' ? 'bg-green-50 text-green-600 border-green-200' :
                                                                'bg-gray-100 text-gray-600 border-gray-200'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <select
                                                        value={order.paymentStatus || 'PENDING'}
                                                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                                        className={`text-[10px] px-2 py-1 rounded-full border font-medium ${PAYMENT_STATUS_COLORS[order.paymentStatus || 'PENDING']
                                                            }`}
                                                    >
                                                        <option value="PENDING">Pendiente</option>
                                                        <option value="PAID">Pagado</option>
                                                    </select>
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium">
                                                    ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex justify-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleDuplicate(order.id)}
                                                            title="Duplicar orden"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                            onClick={() => handleDelete(order.id)}
                                                            title="Eliminar orden"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
