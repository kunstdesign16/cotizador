import { AccountingClient } from '@/components/accounting-client'

export const dynamic = 'force-dynamic'

export default async function AccountingPage() {
    const { prisma } = await import('@/lib/prisma')

    // Fetch all data for accounting
    const [quotes, supplierOrders, fixedExpenses] = await Promise.all([
        prisma.quote.findMany({
            where: { status: 'COBRADO' },
            include: { client: true },
            orderBy: { date: 'desc' }
        }),
        prisma.supplierOrder.findMany({
            where: { paymentStatus: 'PAID' },
            include: {
                supplier: true,
                quote: { include: { client: true } }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.fixedExpense.findMany({
            orderBy: { date: 'desc' }
        })
    ])

    return (
        <AccountingClient
            quotes={JSON.parse(JSON.stringify(quotes))}
            supplierOrders={JSON.parse(JSON.stringify(supplierOrders))}
            fixedExpenses={JSON.parse(JSON.stringify(fixedExpenses))}
        />
    )
}
