
import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { createSupplierTask } from "@/actions/supplier-tasks"
import { useRouter } from "next/navigation"

interface NewTaskDialogProps {
    suppliers: any[]
    quotes: any[]
}

export function NewTaskDialog({ suppliers, quotes }: NewTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)
        const supplierId = formData.get('supplierId') as string
        const quoteId = formData.get('quoteId') as string
        const description = formData.get('description') as string
        const priority = formData.get('priority') as string
        const dateStr = formData.get('date') as string

        if (!supplierId || !description) {
            setIsSubmitting(false)
            return
        }

        const date = dateStr ? new Date(dateStr) : undefined

        await createSupplierTask(
            supplierId,
            quoteId === 'none' ? '' : quoteId,
            description,
            date,
            priority
        )

        setIsSubmitting(false)
        setOpen(false)
        router.refresh()
    }

    if (!open) {
        return (
            <Button onClick={() => setOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Nueva Tarea
            </Button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in-0">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Nueva Tarea</h2>
                    <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <form onSubmit={onSubmit} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="supplierId" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Proveedor *
                        </label>
                        <select
                            name="supplierId"
                            id="supplierId"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Seleccionar proveedor</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="quoteId" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Cotización
                        </label>
                        <select
                            name="quoteId"
                            id="quoteId"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="none">Sin proyecto específico</option>
                            {quotes.map((q) => (
                                <option key={q.id} value={q.id}>{q.project_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Descripción *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            placeholder="Detalles de la tarea..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="priority" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Prioridad
                            </label>
                            <select
                                name="priority"
                                id="priority"
                                defaultValue="MEDIUM"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="LOW">Baja</option>
                                <option value="MEDIUM">Media</option>
                                <option value="HIGH">Alta</option>
                                <option value="URGENT">Urgente</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Fecha Entrega
                            </label>
                            <Input
                                type="date"
                                id="date"
                                name="date"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2 gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Crear Tarea'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
