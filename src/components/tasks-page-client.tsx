"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ShoppingCart } from 'lucide-react'
import { NewTaskDialog } from './new-task-dialog'
import { EditTaskDialog } from './edit-task-dialog'
import { updateTaskStatus, deleteTask } from '@/actions/supplier-tasks'
import { getProductsBySupplier } from '@/actions/products'
import { SupplierOrderForm } from './supplier-order-form'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TasksPageClientProps {
    initialTasks: any[]
    suppliers: any[]
    quotes: any[]
}

export function TasksPageClient({ initialTasks, suppliers, quotes }: TasksPageClientProps) {
    const [tasks, setTasks] = useState(initialTasks)
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'URGENT'>('PENDING')
    const [editingTask, setEditingTask] = useState<any | null>(null)
    const [convertingTask, setConvertingTask] = useState<any | null>(null)
    const [supplierProducts, setSupplierProducts] = useState<any[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const router = useRouter()

    const handleConvertToOrder = async (task: any) => {
        setLoadingProducts(true)
        try {
            const products = await getProductsBySupplier(task.supplierId)
            setSupplierProducts(products)
            setConvertingTask(task)
        } catch {
            toast.error('Error al cargar productos del proveedor')
        } finally {
            setLoadingProducts(false)
        }
    }

    const filteredTasks = tasks.filter((task: any) => {
        if (filter === 'ALL') return true
        if (filter === 'PENDING') return task.status === 'PENDING' || task.status === 'IN_PROGRESS'
        if (filter === 'COMPLETED') return task.status === 'COMPLETED'
        if (filter === 'URGENT') return (task.status !== 'COMPLETED') && (task.priority === 'HIGH' || task.priority === 'URGENT')
        return true
    })

    const handleStatusToggle = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'

        // Optimistic update
        setTasks(tasks.map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t))

        const result = await updateTaskStatus(taskId, newStatus)
        if (!result.success) {
            // Revert on failure
            setTasks(tasks.map((t: any) => t.id === taskId ? { ...t, status: currentStatus } : t))
            alert('Error actualizando estatus')
        } else {
            router.refresh()
        }
    }

    const handleDelete = async (taskId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta tarea?')) return

        const result = await deleteTask(taskId)
        if (result.success) {
            setTasks(tasks.filter((t: any) => t.id !== taskId))
            router.refresh()
        } else {
            alert(result.error || 'Error al eliminar tarea')
        }
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
                        <p className="text-muted-foreground">Gestión de tareas con proveedores</p>
                    </div>
                    <div>
                        <NewTaskDialog suppliers={suppliers} quotes={quotes} />
                    </div>
                </header>

                <div className="flex space-x-2">
                    <Button
                        variant={filter === 'PENDING' ? 'default' : 'outline'}
                        onClick={() => setFilter('PENDING')}
                        size="sm"
                    >
                        Pendientes
                    </Button>
                    <Button
                        variant={filter === 'URGENT' ? 'default' : 'outline'}
                        onClick={() => setFilter('URGENT')}
                        size="sm"
                        className={cn(filter === 'URGENT' && "bg-red-600 hover:bg-red-700")}
                    >
                        Urgentes
                    </Button>
                    <Button
                        variant={filter === 'COMPLETED' ? 'default' : 'outline'}
                        onClick={() => setFilter('COMPLETED')}
                        size="sm"
                    >
                        Completadas
                    </Button>
                    <Button
                        variant={filter === 'ALL' ? 'default' : 'ghost'}
                        onClick={() => setFilter('ALL')}
                        size="sm"
                    >
                        Todas
                    </Button>
                </div>

                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    {filteredTasks.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            No hay tareas en esta vista.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredTasks.map((task: any) => (
                                <div key={task.id} className={cn(
                                    "p-4 hover:bg-muted/50 transition-colors flex justify-between items-center",
                                    task.status === 'COMPLETED' && "opacity-60"
                                )}>
                                    <div className="flex items-start gap-4">
                                        <div className="pt-1">
                                            <input
                                                type="checkbox"
                                                checked={task.status === 'COMPLETED'}
                                                onChange={() => handleStatusToggle(task.id, task.status)}
                                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "font-semibold",
                                                    task.status === 'COMPLETED' && "line-through text-muted-foreground"
                                                )}>{task.supplier.name}</span>

                                                {task.priority && task.priority !== 'MEDIUM' && task.status !== 'COMPLETED' && (
                                                    <span className={cn(
                                                        "text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold",
                                                        task.priority === 'LOW' && "bg-gray-100 text-gray-600 border-gray-200",
                                                        task.priority === 'HIGH' && "bg-orange-50 text-orange-600 border-orange-200",
                                                        task.priority === 'URGENT' && "bg-red-50 text-red-600 border-red-200"
                                                    )}>
                                                        {task.priority === 'LOW' ? 'Baja' : task.priority === 'HIGH' ? 'Alta' : 'Urgente'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-foreground">{task.description}</p>
                                            <div className="text-xs text-muted-foreground">
                                                Proyecto: <span className="font-medium">{task.quote?.project_name || 'Sin proyecto'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {task.expectedDate && (
                                            <div className={cn(
                                                "text-primary/60 text-sm font-medium",
                                                !task.status.includes('COMPLETED') &&
                                                new Date(task.expectedDate) < new Date() &&
                                                (task.project?.status !== 'ENTREGADO' && task.quote?.project?.status !== 'ENTREGADO') &&
                                                "text-red-500 font-bold"
                                            )}>
                                                {new Date(task.expectedDate).toLocaleDateString('es-MX')}
                                            </div>
                                        )}
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/5",
                                                    loadingProducts && convertingTask?.id === task.id && "animate-pulse"
                                                )}
                                                onClick={() => handleConvertToOrder(task)}
                                                title="Generar Orden de Compra"
                                                disabled={loadingProducts}
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setEditingTask(task)}
                                                title="Editar tarea"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(task.id)}
                                                title="Eliminar tarea"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {editingTask && (
                    <EditTaskDialog
                        task={editingTask}
                        onClose={() => setEditingTask(null)}
                    />
                )}

                {convertingTask && (
                    <SupplierOrderForm
                        supplierId={convertingTask.supplierId}
                        products={supplierProducts}
                        projects={quotes}
                        tasks={tasks}
                        autoOpen={true}
                        initialData={{
                            id: '',
                            items: [],
                            quoteId: convertingTask.quoteId,
                            taskId: convertingTask.id
                        }}
                    >
                        {/* Hidden trigger since we use autoOpen */}
                        <div className="hidden" />
                    </SupplierOrderForm>
                )}
            </div>
        </div>
    )
}
