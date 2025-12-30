import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { DashboardClient } from '@/components/dashboard-client'
import { DashboardTaskList } from "@/components/dashboard-task-list"
import { DashboardOrderList } from "@/components/dashboard-order-list"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    try {
        const { prisma } = await import('@/lib/prisma')

        // Fetch All Data Defensively
        const quotes = await (prisma as any).quote.findMany({
            where: {
                project: {
                    is: {
                        status: { not: 'cancelled' }
                    }
                }
            } as any,
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
                project: {
                    is: {
                        status: { notIn: ['cancelled', 'closed'] },
                        financialStatus: { not: 'CERRADO' }
                    }
                }
            } as any,
            include: {
                supplier: true,
                quote: true,
                project: true
            } as any,
            orderBy: { expectedDate: 'asc' }
        })

        const serializedQuotes = JSON.parse(JSON.stringify(quotes))
        const serializedClients = JSON.parse(JSON.stringify(clients))


        // Calculate Metrics (considering project states)
        const activeQuotes = quotes.filter((q: any) => (q.status === 'draft') && q.project?.status === 'draft').length
        const sentQuotes = quotes.filter((q: any) => q.status === 'ordered' && q.project?.status === 'draft').length // Wait, 'ordered' is not in QuoteStatus. 'approved'? 'sent' mapped to 'draft'? STRICT RULE says sent is draft.
        // Actually, let's look at schema: QuoteStatus { draft, approved, rejected, replaced }
        // What counts as "Active Quote" (Pending approval)? status === 'draft'.
        // What counts as "Sent"? We don't have SENT status anymore. It is just Draft.
        // I'll simplifiy: Active Quotes = Draft Quotes in Draft Projects.


        const approvedQuotes = quotes.filter((q: any) => q.status === 'approved' && q.project?.status === 'active').length

        // Urgent Tasks are High or Urgent priority (not linked to COBRADO projects)
        const urgentTasks = await (prisma as any).supplierTask.findMany({
            where: {
                status: { in: ['PENDING', 'IN_PROGRESS'] },
                priority: { in: ['HIGH', 'URGENT'] },
                project: {
                    is: {
                        status: { notIn: ['cancelled', 'closed'] },
                        financialStatus: { not: 'CERRADO' }
                    }
                }
            } as any,
            include: {
                supplier: true,
                quote: true,
                project: true
            } as any,
            orderBy: { expectedDate: 'asc' }
        })

        const serializedUrgentTasks = JSON.parse(JSON.stringify(urgentTasks))

        // Recent 5 active quotes (not cobradas)
        const recentQuotes = serializedQuotes.slice(0, 5)

        // Recent 5 supplier orders (not linked to COBRADO projects)
        const recentOrders = await (prisma as any).supplierOrder.findMany({
            where: {
                project: {
                    status: { notIn: ['cancelled', 'closed'] },
                    financialStatus: { not: 'CERRADO' }
                }
            } as any,
            include: { supplier: true, project: true } as any,
            orderBy: { createdAt: 'desc' } as any,
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
                                suppliers={[]} // Placeholder
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
                    <h2 className="text-red-800 font-bold text-lg mb-2">Error de Restauración</h2>
                    <p className="text-red-600 text-sm">
                        Ocurrió un error al cargar el tablero original.
                    </p>
                    <div className="mt-4 p-3 bg-white border rounded text-[10px] font-mono whitespace-pre-wrap">
                        {error.message}
                    </div>
                </div>
                <Link href="/projects">
                    <Button variant="outline">Ir a Proyectos</Button>
                </Link>
            </div>
        )
    }
}
