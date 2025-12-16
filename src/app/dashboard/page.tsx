import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Plus, FileText, Users } from 'lucide-react'
import { DashboardClient } from '@/components/dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const { prisma } = await import('@/lib/prisma')

    // Fetch Quotes
    const quotes = await prisma.quote.findMany({
        include: { client: true },
        orderBy: { updatedAt: 'desc' }
    })

    // Fetch Clients
    const clients = await prisma.client.findMany({
        orderBy: { name: 'asc' }
    })

    // Fetch Pending Tasks
    const pendingTasks = await prisma.supplierTask.findMany({
        where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] }
        },
        include: {
            supplier: true,
            quote: true
        },
        orderBy: { expectedDate: 'asc' }
    })


    const serializedQuotes = JSON.parse(JSON.stringify(quotes))
    const serializedClients = JSON.parse(JSON.stringify(clients))
    const serializedTasks = JSON.parse(JSON.stringify(pendingTasks))

    // Calculate Metrics
    const activeQuotes = quotes.filter(q => q.status === 'DRAFT' || q.status === 'SAVED').length
    const sentQuotes = quotes.filter(q => q.status === 'SENT').length
    const approvedQuotes = quotes.filter(q => q.status === 'APPROVED' || q.status === 'FACTURADO').length
    const cobradoQuotes = quotes.filter(q => q.status === 'COBRADO').length
    const approvedQuotesTotal = quotes
        .filter(q => q.status === 'COBRADO')
        .reduce((acc, q) => acc + (q.total || 0), 0)

    // Fetch Supplier Orders for payment tracking
    const supplierOrders = await prisma.supplierOrder.findMany({
        include: { supplier: true }
    })

    const paidOrders = supplierOrders.filter(o => o.paymentStatus === 'PAID').length
    const paidOrdersTotal = supplierOrders
        .filter(o => o.paymentStatus === 'PAID')
        .reduce((acc, o) => {
            // Handle both object and string formats (Prisma Json vs serialized)
            const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items as any[])
            const orderTotal = Array.isArray(items) ? items.reduce((sum, item) => sum + (item.unitCost || 0) * (item.quantity || 0), 0) : 0
            return acc + orderTotal
        }, 0)

    // Count total pending tasks
    const pendingTasksCount = await prisma.supplierTask.count({
        where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] }
        }
    })

    // Urgent Tasks are High or Urgent priority
    const urgentTasks = await prisma.supplierTask.findMany({
        where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
            priority: { in: ['HIGH', 'URGENT'] }
        },
        include: {
            supplier: true,
            quote: true
        },
        orderBy: { expectedDate: 'asc' }
    })

    const serializedUrgentTasks = JSON.parse(JSON.stringify(urgentTasks))

    // Recent 5 quotes
    const recentQuotes = serializedQuotes.slice(0, 5)

    // Recent 5 supplier orders
    const recentOrders = await prisma.supplierOrder.findMany({
        include: { supplier: true },
        orderBy: { createdAt: 'desc' },
        take: 5
    })
    const serializedOrders = JSON.parse(JSON.stringify(recentOrders))

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Inicio</h1>
                        <p className="text-muted-foreground">Resumen de actividad</p>
                    </div>
                </header>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Cotizaciones Activas</h3>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{activeQuotes}</div>
                        <p className="text-xs text-muted-foreground">
                            Borradores o Guardadas
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Enviadas</h3>
                            <div className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{sentQuotes}</div>
                        <p className="text-xs text-muted-foreground">
                            Pendientes de Aprobación
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Aprobadas</h3>
                            <div className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{approvedQuotes}</div>
                        <p className="text-xs text-muted-foreground">
                            Listas para Producción
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Tareas Pendientes</h3>
                            <div className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{pendingTasksCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {urgentTasks.length} Urgentes
                        </p>
                    </div>

                    {/* Billed Projects Metric */}
                    <div className="rounded-xl border bg-emerald-50 text-emerald-900 shadow-sm p-6 md:col-span-2 lg:col-span-2 border-emerald-200">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-lg font-semibold text-emerald-800">Proyectos Cobrados</h3>
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="font-bold">$</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-4 mt-2">
                            <div className="text-4xl font-bold">
                                ${approvedQuotesTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm font-medium text-emerald-700">
                                en {cobradoQuotes} proyectos
                            </div>
                        </div>
                        <p className="text-xs text-emerald-600/80 mt-1">
                            Suma total de cotizaciones con estatus COBRADO
                        </p>
                    </div>

                    {/* Paid Orders Metric */}
                    <div className="rounded-xl border bg-blue-50 text-blue-900 shadow-sm p-6 md:col-span-2 lg:col-span-2 border-blue-200">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-lg font-semibold text-blue-800">Órdenes Pagadas</h3>
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="font-bold">$</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-4 mt-2">
                            <div className="text-4xl font-bold">
                                ${paidOrdersTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm font-medium text-blue-700">
                                en {paidOrders} órdenes
                            </div>
                        </div>
                        <p className="text-xs text-blue-600/80 mt-1">
                            Total pagado a proveedores
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Recent Quotes */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Cotizaciones Recientes</h2>
                            <Link href="/quotes/new">
                                <Button variant="outline" size="sm" className="gap-2">
                                    Ver Todas
                                </Button>
                            </Link>
                        </div>
                        <DashboardClient quotes={recentQuotes} clients={serializedClients} />
                    </div>

                    {/* Sidebar: Urgent Tasks */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            Tareas Urgentes
                            {urgentTasks.length > 0 && (
                                <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                            )}
                        </h2>
                        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                            {serializedUrgentTasks.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No hay tareas urgentes.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {serializedUrgentTasks.map((task: any) => (
                                        <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-sm">{task.supplier.name}</span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200 uppercase font-bold">
                                                    {task.priority || 'URGENTE'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground mb-1">{task.description}</p>

                                            <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                                                <span className="truncate max-w-[120px]">{task.quote?.project_name || 'Sin proyecto'}</span>
                                                {task.expectedDate && (
                                                    <span>{new Date(task.expectedDate).toLocaleDateString('es-MX')}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4">
                            <Link href="/tasks">
                                <Button className="w-full" variant="outline">Ver Todas las Tareas</Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Supplier Orders Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Órdenes de Compra Recientes</h2>
                        <Link href="/supplier-orders">
                            <Button variant="outline" size="sm">Ver Todas</Button>
                        </Link>
                    </div>
                    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                        {serializedOrders.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No hay órdenes registradas.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {serializedOrders.map((order: any) => {
                                    // Handle both object and string formats (Prisma Json vs serialized)
                                    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items as any[])
                                    const total = Array.isArray(items) ? items.reduce((sum: number, item: any) =>
                                        sum + (item.unitCost || 0) * (item.quantity || 0), 0
                                    ) : 0

                                    return (
                                        <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-semibold text-sm">{order.supplier.name}</span>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(order.createdAt).toLocaleDateString('es-MX')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-sm">
                                                        ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                    order.status === 'ORDERED' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                        order.status === 'RECEIVED' ? 'bg-green-50 text-green-600 border-green-200' :
                                                            'bg-gray-100 text-gray-600 border-gray-200'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${order.paymentStatus === 'PAID'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                    {order.paymentStatus === 'PAID' ? 'Pagado' : 'Pendiente'}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
