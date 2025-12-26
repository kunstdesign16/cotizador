"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateSupplierTask } from "@/actions/supplier-tasks"
import { useRouter } from "next/navigation"

interface EditTaskDialogProps {
    task: any
    onClose: () => void
}

export function EditTaskDialog({ task, onClose }: EditTaskDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)

        const description = formData.get('description') as string
        const priority = formData.get('priority') as string
        const dateStr = formData.get('date') as string

        const result = await updateSupplierTask(task.id, {
            description,
            priority,
            expectedDate: dateStr ? new Date(dateStr) : null
        })

        setIsSubmitting(false)
        if (result.success) {
            onClose()
            router.refresh()
        } else {
            alert(result.error || 'Error al actualizar tarea')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in-0">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Editar Tarea</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <form onSubmit={onSubmit} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción *</label>
                        <textarea
                            name="description"
                            required
                            defaultValue={task.description}
                            placeholder="Detalles de la tarea..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Prioridad</label>
                            <select
                                name="priority"
                                defaultValue={task.priority}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="LOW">Baja</option>
                                <option value="MEDIUM">Media</option>
                                <option value="HIGH">Alta</option>
                                <option value="URGENT">Urgente</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha Entrega</label>
                            <Input
                                type="date"
                                name="date"
                                defaultValue={task.expectedDate ? new Date(task.expectedDate).toISOString().split('T')[0] : ''}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2 gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
