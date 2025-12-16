import { SupplierOrdersClient } from '@/components/supplier-orders-client'

export const dynamic = 'force-dynamic'

export default async function SupplierOrdersPage() {
    const { prisma } = await import('@/lib/prisma')

    const orders = await prisma.supplierOrder.findMany({
        include: {
            supplier: true,
        },
        orderBy: { createdAt: 'desc' }
    })

    const serializedOrders = JSON.parse(JSON.stringify(orders))

    return <SupplierOrdersClient initialOrders={serializedOrders} />
}
