import { SupplierOrdersClient } from '@/components/supplier-orders-client'
import { CreateOrderDialog } from '@/components/create-order-dialog'

export const dynamic = 'force-dynamic'

export default async function SupplierOrdersPage() {
    const { prisma } = await import('@/lib/prisma')

    const [orders, suppliers] = await Promise.all([
        prisma.supplierOrder.findMany({
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
}
