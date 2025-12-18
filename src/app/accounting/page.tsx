import { AccountingClient } from '@/components/accounting-client'

export const dynamic = 'force-dynamic'

export default async function AccountingPage() {
    const { prisma } = await import('@/lib/prisma')

    try {
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
    } catch (error) {
        console.error("Error loading accounting data:", error)
        return (
            <div className="p-8 text-center text-destructive">
                <h2 className="text-xl font-bold mb-2">Error al cargar contabilidad</h2>
                <p>Ocurrió un problema al conectar con la base de datos.</p>
                <code className="block mt-4 p-2 bg-muted rounded text-xs">{String(error)}</code>
            </div>
        )
    }
}
