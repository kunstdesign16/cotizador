'use client'

import { useState, useActionState, useEffect } from "react"
import { getSellers, createSeller, updateSeller, deleteSeller } from "@/actions/sellers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function SellersPage() {
    const [sellers, setSellers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingSeller, setEditingSeller] = useState<any>(null)

    const loadSellers = async () => {
        setIsLoading(true)
        const data = await getSellers()
        setSellers(data)
        setIsLoading(false)
    }

    useEffect(() => {
        loadSellers()
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            email: formData.get('email') || '',
            phone: formData.get('phone') || ''
        }

        let res;
        if (editingSeller) {
            res = await updateSeller(editingSeller.id, data)
        } else {
            res = await createSeller(data)
        }

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(`Vendedor ${editingSeller ? 'actualizado' : 'creado'} correctamente`)
            setIsDialogOpen(false)
            loadSellers()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este vendedor?')) return
        const res = await deleteSeller(id)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Vendedor eliminado')
            loadSellers()
        }
    }

    const openEdit = (seller: any) => {
        setEditingSeller(seller)
        setIsDialogOpen(true)
    }

    const openCreate = () => {
        setEditingSeller(null)
        setIsDialogOpen(true)
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-brand-header text-primary">Vendedores</h1>
                    <p className="text-muted-foreground">Administra los vendedores para las cotizaciones</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate} className="font-brand-header">
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Vendedor
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-brand-header text-xl">
                                {editingSeller ? 'Editar Vendedor' : 'Nuevo Vendedor'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre</label>
                                <Input name="name" defaultValue={editingSeller?.name} required placeholder="Nombre completo" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input name="email" type="email" defaultValue={editingSeller?.email} placeholder="correo@ejemplo.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Teléfono</label>
                                <Input name="phone" defaultValue={editingSeller?.phone} placeholder="10 dígitos" />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit">Guardar</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="font-semibold text-primary">Nombre</TableHead>
                            <TableHead className="font-semibold text-primary">Email</TableHead>
                            <TableHead className="font-semibold text-primary">Teléfono</TableHead>
                            <TableHead className="text-right font-semibold text-primary">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center h-24">Cargando...</TableCell></TableRow>
                        ) : sellers.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No hay vendedores registrados</TableCell></TableRow>
                        ) : (
                            sellers.map((seller) => (
                                <TableRow key={seller.id}>
                                    <TableCell className="font-medium">{seller.name}</TableCell>
                                    <TableCell>{seller.email || '-'}</TableCell>
                                    <TableCell>{seller.phone || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(seller)}>
                                                <Edit className="w-4 h-4 text-primary" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(seller.id)}>
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
