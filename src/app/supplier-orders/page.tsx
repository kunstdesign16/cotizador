import { SupplierOrdersClient } from '@/components/supplier-orders-client'
import { CreateOrderDialog } from '@/components/create-order-dialog'

export const dynamic = 'force-dynamic'

export default async function SupplierOrdersPage() {
    try {
        const { prisma } = await import('@/lib/prisma')

        const [orders, suppliers] = await Promise.all([
            (prisma as any).supplierOrder.findMany({
                include: {
                    supplier: true,
                    quote: {
                        include: {
                            client: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.supplier.findMany({
                orderBy: { name: 'asc' },
                select: { id: true, name: true }
            })
        ])

        const serializedOrders = JSON.parse(JSON.stringify(orders))

        return (
            <div className="min-h-screen bg-background p-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    <header className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Ordenes de Compra</h1>
                            <p className="text-muted-foreground">Gestión de compras a proveedores</p>
                        </div>
                        <CreateOrderDialog suppliers={suppliers} />
                    </header>

                    <SupplierOrdersClient initialOrders={serializedOrders} />
                </div>
            </div>
        )
    } catch (error: any) {
        console.error('Error in SupplierOrdersPage:', error)
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-xl font-bold text-red-600">Error en Órdenes de Compra</h1>
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <div className="p-4 bg-muted rounded text-[10px] font-mono whitespace-pre-wrap text-left max-h-[200px] overflow-auto">
                    {error.stack}
                </div>
            </div>
        )
    }
}
