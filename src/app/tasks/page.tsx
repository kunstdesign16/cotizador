import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { CheckSquare } from 'lucide-react'

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

    const serializedTasks = JSON.parse(JSON.stringify(tasks))

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
                        <p className="text-muted-foreground">Gestión de tareas con proveedores</p>
                    </div>
                </header>

                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    {serializedTasks.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            No hay tareas registradas.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {serializedTasks.map((task: any) => (
                                <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors flex justify-between items-center">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{task.supplier.name}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${task.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                    task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                        'bg-green-50 text-green-600 border-green-200'
                                                }`}>
                                                {task.status === 'PENDING' ? 'Pendiente' : task.status === 'IN_PROGRESS' ? 'En Progreso' : 'Completado'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground">{task.description}</p>
                                        <div className="text-xs text-muted-foreground">
                                            Proyecto: <span className="font-medium">{task.quote?.project_name || 'Sin proyecto'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm">
                                        {task.expectedDate && (
                                            <div className="text-muted-foreground">
                                                Entrega: {new Date(task.expectedDate).toLocaleDateString('es-MX')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
