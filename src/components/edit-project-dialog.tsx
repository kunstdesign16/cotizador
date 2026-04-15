'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { updateProject } from '@/actions/projects'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface EditProjectDialogProps {
    project: any
    clients: any[]
}

export function EditProjectDialog({ project, clients }: EditProjectDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        const name = formData.get('name') as string
        const clientId = formData.get('clientId') as string
        const description = formData.get('description') as string

        try {
            const result = await updateProject(project.id, { name, clientId, description })

            if (result.success) {
                toast.success("Proyecto actualizado correctamente")
                setOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || "No se pudo actualizar el proyecto")
            }
        } catch (error: any) {
            toast.error("Error de red al actualizar el proyecto")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-secondary text-primary font-brand-header uppercase tracking-wider text-xs gap-2">
                    <Pencil className="h-3.5 w-3.5" /> Editar Proyecto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Proyecto</DialogTitle>
                        <DialogDescription>
                            Modifica los datos principales del proyecto.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Proyecto</Label>
                            <Input id="name" name="name" defaultValue={project.name} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="clientId">Cliente</Label>
                            <Select name="clientId" defaultValue={project.clientId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.company || client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción (Opcional)</Label>
                            <Textarea id="description" name="description" defaultValue={project.description || ''} placeholder="Detalles generales del proyecto..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
