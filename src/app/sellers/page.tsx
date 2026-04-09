'use client'

import { useState, useEffect } from "react"
import { getSellers, createSeller, updateSeller, deleteSeller } from "@/actions/sellers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Users } from "lucide-react"
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
        <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-secondary/50 shadow-sm">
                <div>
                    <h1 className="text-3xl font-brand-header text-primary tracking-tight">Gestión de Vendedores</h1>
                    <p className="text-muted-foreground text-sm">Administra el equipo comercial y sus datos de contacto para documentos oficiales.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate} className="font-brand-header rounded-xl hover:scale-105 transition-transform">
                            <Plus className="w-4 h-4 mr-2" />
                            Añadir Vendedor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="font-brand-header text-2xl text-primary">
                                {editingSeller ? 'Editar Perfil' : 'Nuevo Integrante'}
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground">Ingresa los datos tal como deben aparecer en los pies de página de los PDFs.</p>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-primary/70 uppercase tracking-wider ml-1">Nombre Completo</label>
                                <Input name="name" defaultValue={editingSeller?.name} required placeholder="Ej. Juan Pérez" className="rounded-xl border-secondary focus:ring-primary/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-primary/70 uppercase tracking-wider ml-1">Correo Electrónico</label>
                                <Input name="email" type="email" defaultValue={editingSeller?.email} placeholder="juan@kunstdesign.com.mx" className="rounded-xl border-secondary focus:ring-primary/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-primary/70 uppercase tracking-wider ml-1">Teléfono de contacto</label>
                                <Input name="phone" defaultValue={editingSeller?.phone} placeholder="+52 33 ..." className="rounded-xl border-secondary focus:ring-primary/20" />
                            </div>
                            <div className="flex justify-end pt-4 gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancelar</Button>
                                <Button type="submit" className="rounded-xl px-8">Confirmar Guardado</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-3xl border border-secondary shadow-xl shadow-primary/5 overflow-hidden transition-all duration-300 hover:shadow-primary/10">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-secondary/20 hover:bg-secondary/20 border-b border-secondary">
                            <TableHead className="py-5 font-bold text-primary/80 uppercase text-[10px] tracking-widest pl-8">Vendedor</TableHead>
                            <TableHead className="py-5 font-bold text-primary/80 uppercase text-[10px] tracking-widest">Contacto Digital</TableHead>
                            <TableHead className="py-5 font-bold text-primary/80 uppercase text-[10px] tracking-widest">Línea Directa</TableHead>
                            <TableHead className="py-5 text-right font-bold text-primary/80 uppercase text-[10px] tracking-widest pr-8">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-40">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        <span className="text-sm font-medium text-muted-foreground">Sincronizando equipo...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : sellers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-64">
                                    <div className="max-w-[280px] mx-auto space-y-3 opacity-60">
                                        <Users className="w-12 h-12 mx-auto text-primary/20" />
                                        <p className="text-lg font-brand-header text-primary">No hay vendedores todavía</p>
                                        <p className="text-xs leading-relaxed text-muted-foreground">Comienza agregando al primer integrante de tu equipo para personalizar las cotizaciones.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sellers.map((seller) => (
                                <TableRow key={seller.id} className="group hover:bg-secondary/10 transition-colors">
                                    <TableCell className="py-6 pl-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                {seller.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-primary">{seller.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{seller.email || <span className="text-xs italic opacity-40">Sin correo</span>}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{seller.phone || <span className="text-xs italic opacity-40">Sin teléfono</span>}</TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(seller)} className="rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(seller.id)} className="rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-50">
                    SISTEMA DE GESTIÓN INTERNA • KUNST & DESIGN
                </p>
            </div>
        </div>
    )
}
