import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
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

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Resumen operativo general</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/quotes/new">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nueva Cotización
                            </Button>
                        </Link>
                        <Link href="/clients">
                            <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Clientes
                            </Button>
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Projects */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-semibold">Proyectos Recientes</h2>
                        <DashboardClient quotes={serializedQuotes} clients={serializedClients} />
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
                    </div>
                </div>
            </div>
        </div>
    )
}
