import { ExpensesClient } from '@/components/expenses-client'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
    const { prisma } = await import('@/lib/prisma')

    const expenses = await prisma.fixedExpense.findMany({
        orderBy: { date: 'desc' }
    })

    const serializedExpenses = JSON.parse(JSON.stringify(expenses))

    return <ExpensesClient initialExpenses={serializedExpenses} />
}
