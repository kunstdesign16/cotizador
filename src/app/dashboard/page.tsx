import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Plus, FileText, Users } from 'lucide-react'
import { DashboardClient } from '@/components/dashboard-client'
import { DashboardTaskList } from "@/components/dashboard-task-list"
import { DashboardOrderList } from "@/components/dashboard-order-list"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    try {
        const { prisma } = await import('@/lib/prisma')
        const quotes = await (prisma as any).quote.findMany({
            include: {
                client: true,
                expenses: true,
                items: true,
                project: true
            } as any,
            orderBy: { updatedAt: 'desc' }
        })

        // Fetch Clients
        const clients = await prisma.client.findMany({
            orderBy: { name: 'asc' }
        })

        // Fetch Pending Tasks (not linked to COBRADO projects)
        const pendingTasks = await (prisma as any).supplierTask.findMany({
            where: {
                status: { in: ['PENDING', 'IN_PROGRESS'] },
                NOT: {
                    quote: { status: 'COBRADO' }
                }
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
        const activeQuotes = quotes.filter((q: any) => q.status === 'DRAFT' || q.status === 'SAVED').length
        const sentQuotes = quotes.filter((q: any) => q.status === 'SENT').length
        const approvedQuotes = quotes.filter((q: any) => q.status === 'APPROVED' || q.status === 'FACTURADO').length
        const cobradoQuotesTotal = quotes
            .filter((q: any) => q.status === 'COBRADO')
            .reduce((acc: number, q: any) => acc + (q.total || 0), 0)

        // Fetch Supplier Orders for payment tracking
        const supplierOrders = await (prisma as any).supplierOrder.findMany({
            include: { supplier: true }
        })

        const suppliers = await (prisma as any).supplier.findMany({
            orderBy: { name: 'asc' }
        })

        // Urgent Tasks are High or Urgent priority (not linked to COBRADO projects)
        const urgentTasks = await (prisma as any).supplierTask.findMany({
            where: {
                status: { in: ['PENDING', 'IN_PROGRESS'] },
                priority: { in: ['HIGH', 'URGENT'] },
                NOT: {
                    quote: { status: 'COBRADO' }
                }
            },
            include: {
                supplier: true,
                quote: true
            },
            orderBy: { expectedDate: 'asc' }
        })

        const serializedUrgentTasks = JSON.parse(JSON.stringify(urgentTasks))

        // Recent 5 active quotes (not cobradas)
        const recentQuotes = serializedQuotes.filter((q: any) => q.status !== 'COBRADO').slice(0, 5)

        // Recent 5 supplier orders (not linked to COBRADO projects)
        const recentOrders = await (prisma as any).supplierOrder.findMany({
            where: {
                NOT: {
                    quote: { status: 'COBRADO' }
                }
            },
            include: { supplier: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        })
        const serializedOrders = JSON.parse(JSON.stringify(recentOrders))

        const pendingTasksCount = pendingTasks.length

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


                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content: Recent Quotes */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Cotizaciones Recientes</h2>
                                <Link href="/quotes">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        Ver Todas
                                    </Button>
                                </Link>
                            </div>
                            <DashboardClient
                                quotes={recentQuotes}
                                clients={serializedClients}
                                suppliers={JSON.parse(JSON.stringify(suppliers))}
                            />
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
                                <DashboardTaskList tasks={serializedUrgentTasks} />
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
                            <DashboardOrderList orders={serializedOrders} />
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        console.error('Error loading dashboard:', error)
        return (
            <div className="p-8 max-w-2xl mx-auto space-y-4">
                <div className="p-6 border border-red-200 bg-red-50 rounded-xl">
                    <h2 className="text-red-800 font-bold text-lg mb-2">Error de Carga</h2>
                    <p className="text-red-600 text-sm">
                        Ocurrió un error al cargar los datos del tablero. Esto suele deberse a cambios en la base de datos que aún no se han sincronizado.
                    </p>

                    <div className="mt-6 space-y-2">
                        <p className="text-[10px] font-mono text-red-500 uppercase tracking-wider">Detalle Técnico:</p>
                        <pre className="p-3 bg-white border rounded text-[10px] font-mono text-gray-700 overflow-auto max-h-[200px]">
                            {error.message || 'No se proporcionó mensaje de error'}
                            {"\n\n"}
                            {error.stack}
                        </pre>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => window.location.reload()}
                        >
                            Reintentar
                        </Button>
                        <Link href="/accounting">
                            <Button variant="outline" size="sm">Ir a Contabilidad</Button>
                        </Link>
                    </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    <p className="font-semibold mb-1">💡 Sugerencia:</p>
                    Asegúrate de haber ejecutado <code>npx prisma db push</code> para sincronizar los nuevos campos de la Fase 9 (Cierre de Proyectos).
                </div>
            </div>
        )
    }
}
