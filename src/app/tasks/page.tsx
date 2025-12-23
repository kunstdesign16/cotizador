import { TasksPageClient } from '@/components/tasks-page-client'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
    const { prisma } = await import('@/lib/prisma')

    // Fetch All Tasks
    const tasks = await prisma.supplierTask.findMany({
        include: {
            supplier: true,
            quote: true
        },
        orderBy: { expectedDate: 'asc' }
    })

    // Fetch Suppliers for the "New Task" dialog
    const suppliers = await prisma.supplier.findMany({
        orderBy: { name: 'asc' }
    })

    // Fetch Active Quotes for the "New Task" dialog
    const quotes = await prisma.quote.findMany({
        where: { status: { not: 'COBRADO' } },
        include: { client: true },
        orderBy: { updatedAt: 'desc' }
    })

    // Serialize dates/decimals
    const serializedTasks = JSON.parse(JSON.stringify(tasks))
    const serializedSuppliers = JSON.parse(JSON.stringify(suppliers))
    const serializedQuotes = JSON.parse(JSON.stringify(quotes))

    return (
        <TasksPageClient
            initialTasks={serializedTasks}
            suppliers={serializedSuppliers}
            quotes={serializedQuotes}
        />
    )
}
