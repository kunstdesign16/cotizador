"use client"

import { useState } from "react"
import Link from 'next/link'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateTaskStatus, updateTaskPriority } from "@/actions/supplier-tasks"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Task {
    id: string
    description: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    expectedDate: Date | null
    supplier: {
        name: string
    }
    quote?: {
        project_name: string
    }
}

interface DashboardTaskListProps {
    tasks: Task[]
}

const statusMap: Record<string, string> = {
    'PENDING': 'Pendiente',
    'IN_PROGRESS': 'En Progreso',
    'COMPLETED': 'Completado'
}

const priorityMap: Record<string, string> = {
    'LOW': 'Baja',
    'MEDIUM': 'Media',
    'HIGH': 'Alta',
    'URGENT': 'Urgente'
}

export function DashboardTaskList({ tasks }: DashboardTaskListProps) {
    const router = useRouter()

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            await updateTaskStatus(taskId, newStatus as any)
            toast.success("Estatus actualizado")
            router.refresh()
        } catch (error) {
            toast.error("Error al actualizar estatus")
        }
    }

    const handlePriorityChange = async (taskId: string, newPriority: string) => {
        try {
            await updateTaskPriority(taskId, newPriority as any)
            toast.success("Prioridad actualizada")
            router.refresh()
        } catch (error) {
            toast.error("Error al actualizar prioridad")
        }
    }

    if (tasks.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground text-sm">
                No hay tareas urgentes.
            </div>
        )
    }

    return (
        <div className="divide-y max-h-[500px] overflow-y-auto">
            {tasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <Link href="/tasks" className="flex-1">
                            <span className="font-semibold text-sm block">{task.supplier.name}</span>
                            <p className="text-sm text-foreground mb-1 line-clamp-2">{task.description}</p>
                        </Link>

                        <div className="w-[110px]">
                            <Select
                                defaultValue={task.priority}
                                onValueChange={(val) => handlePriorityChange(task.id, val)}
                            >
                                <SelectTrigger className={`h-6 text-[10px] px-2 uppercase font-bold border-0 
                                    ${task.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                                        task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                    }`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Baja</SelectItem>
                                    <SelectItem value="MEDIUM">Media</SelectItem>
                                    <SelectItem value="HIGH">Alta</SelectItem>
                                    <SelectItem value="URGENT">Urgente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs mt-3">
                        <span className="text-muted-foreground truncate max-w-[120px]">{task.quote?.project_name || 'Sin proyecto'}</span>

                        <div className="w-[120px]">
                            <Select
                                defaultValue={task.status}
                                onValueChange={(val) => handleStatusChange(task.id, val)}
                            >
                                <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pendiente</SelectItem>
                                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                                    <SelectItem value="COMPLETED">Completado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {task.expectedDate && (
                        <div className="mt-2 text-[10px] text-right text-muted-foreground">
                            Entrega: {new Date(task.expectedDate).toLocaleDateString('es-MX')}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
