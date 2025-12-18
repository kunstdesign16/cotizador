import { ExpensesClient } from '@/components/expenses-client'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
    const { prisma } = await import('@/lib/prisma')

    try {
        const expenses = await prisma.fixedExpense.findMany({
            orderBy: { date: 'desc' }
        })

        const serializedExpenses = JSON.parse(JSON.stringify(expenses))

        return <ExpensesClient initialExpenses={serializedExpenses} />
    } catch (error) {
        console.error("Error loading expenses:", error)
        return (
            <div className="p-8 text-center text-destructive">
                <h2 className="text-xl font-bold mb-2">Error al cargar gastos</h2>
                <p>Ocurrió un problema al conectar con la base de datos.</p>
                <code className="block mt-4 p-2 bg-muted rounded text-xs">{String(error)}</code>
            </div>
        )
    }
}
