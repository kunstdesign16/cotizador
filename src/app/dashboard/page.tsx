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
    const activeQuotes = quotes.filter(q => q.status !== 'DRAFT' && q.status !== 'COBRADO').length
    const pendingTasksCount = pendingTasks.length
    const totalSales = quotes
        .filter(q => q.status === 'FACTURADO' || q.status === 'COBRADO')
        .reduce((acc, q) => acc + q.total, 0)

    // Only show recent quotes in the dashboard list (e.g. top 5 recent)
    // The DashboardClient filters anyway, but let's pass all for now or slice
    const recentQuotes = serializedQuotes.slice(0, 5)

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
                        <div className="text-2xl font-bold">{quotes.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeQuotes} en proceso
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Tareas Pendientes</h3>
                            <div className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{pendingTasksCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Servicios y Productos
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Ventas Totales</h3>
                            <div className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">${totalSales.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-muted-foreground">
                            Acumulado (Facturado/Cobrado)
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Clientes</h3>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{clients.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Registrados
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Projects */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Proyectos Recientes</h2>
                            <Link href="/quotes/new">
                                <Button variant="outline" size="sm" className="gap-2">
                                    Ver Todos
                                </Button>
                            </Link>
                        </div>
                        <DashboardClient quotes={recentQuotes} clients={serializedClients} />
                    </div>

                    {/* Sidebar: Tasks */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Tareas Pendientes</h2>
                        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                            {serializedTasks.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No hay tareas pendientes.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {serializedTasks.map((task: any) => (
                                        <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-sm">{task.supplier.name}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${task.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                    'bg-blue-50 text-blue-600 border-blue-200'
                                                    }`}>
                                                    {task.status === 'PENDING' ? 'Pendiente' : 'En Progreso'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground mb-1">{task.description}</p>

                                            <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                                                <span>{task.quote?.project_name || 'Sin proyecto'}</span>
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
            </div>
        </div>
    )
}
