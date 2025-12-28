import { TasksPageClient } from '@/components/tasks-page-client'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
    try {
        const { prisma } = await import('@/lib/prisma')

        // Fetch All Tasks
        const tasks = await (prisma as any).supplierTask.findMany({
            include: {
                supplier: true,
                quote: {
                    include: { project: true }
                },
                project: true
            } as any,
            orderBy: { expectedDate: 'asc' }
        })

        // Fetch Suppliers for the "New Task" dialog
        const suppliers = await prisma.supplier.findMany({
            orderBy: { name: 'asc' }
        })

        // Fetch Active Quotes for the "New Task" dialog
        const quotes = await (prisma as any).quote.findMany({
            where: {
                status: { not: 'COBRADO' }
            } as any,
            include: { client: true } as any,
            orderBy: { updatedAt: 'desc' } as any
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
    } catch (error: any) {
        console.error('Error in TasksPage:', error)
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-xl font-bold text-red-600">Error en Tareas</h1>
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <div className="p-4 bg-muted rounded text-[10px] font-mono whitespace-pre-wrap text-left max-h-[200px] overflow-auto">
                    {error.stack}
                </div>
            </div>
        )
    }
}
