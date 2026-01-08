'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import { createProject } from '@/actions/projects'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface CreateProjectDialogProps {
    clients: any[]
}

export function CreateProjectDialog({ clients }: CreateProjectDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        const name = formData.get('name') as string
        const clientId = formData.get('clientId') as string
        const description = formData.get('description') as string

        try {
            const result = await createProject({ name, clientId, description })

            if (result.success && result.data) {
                toast({
                    title: "Proyecto creado",
                    description: `El proyecto "${name}" ha sido creado con éxito.`,
                })
                setOpen(false)
                router.push(`/projects/${result.data.id}`)
                router.refresh()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "No se pudo crear el proyecto. Intenta de nuevo.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error de red al crear el proyecto.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Nuevo Proyecto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                        <DialogDescription>
                            Define el nombre y el cliente para iniciar la gestión del proyecto.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Proyecto</Label>
                            <Input id="name" name="name" placeholder="Ej. Campaña Navideña 2025" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="clientId">Cliente</Label>
                            <Select name="clientId" required>
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
                            <Textarea id="description" name="description" placeholder="Detalles generales del proyecto..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creando..." : "Crear Proyecto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
