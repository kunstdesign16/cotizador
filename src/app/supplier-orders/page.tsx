import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SupplierOrdersPage() {
    const { prisma } = await import('@/lib/prisma')

    // Fetch All Supplier Orders
    const orders = await prisma.supplierOrder.findMany({
        include: {
            supplier: true,
        },
        orderBy: { createdAt: 'desc' }
    })

    const serializedOrders = JSON.parse(JSON.stringify(orders))

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
                                    <th className="py-3 px-4 text-right font-medium">Total</th>
                                    <th className="py-3 px-4 text-right font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {serializedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                            No hay ordenes registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    serializedOrders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-muted/50">
                                            <td className="py-3 px-4">
                                                {new Date(order.createdAt).toLocaleDateString('es-MX')}
                                            </td>
                                            <td className="py-3 px-4 font-medium">
                                                {order.supplier.name}
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
                                            <td className="py-3 px-4 text-right">
                                                ${order.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/suppliers/${order.supplierId}`}>
                                                    <Button size="sm" variant="ghost">Ver Proveedor</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
