'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient, updateClient } from '@/actions/clients'
import { Plus, X, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'

type ClientData = {
    id?: string
    name: string
    company?: string | null
    email?: string | null
    phone?: string | null
}

export function ClientFormDialog({ children, client }: { children?: React.ReactNode, client?: ClientData }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const isEditing = !!client

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        let result
        if (isEditing && client?.id) {
            result = await updateClient(client.id, {}, formData)
        } else {
            result = await createClient({}, formData)
        }

        setLoading(false)

        if (result.success) {
            setOpen(false)
        } else {
            alert(result.message || 'Error al guardar')
        }
    }

    return (
        <>
            <div onClick={() => setOpen(true)} className="inline-block cursor-pointer">
                {children || (
                    <Button className="gap-2" variant={isEditing ? 'ghost' : 'default'} size={isEditing ? 'icon' : 'default'}>
                        {isEditing ? <Pencil className="h-4 w-4" /> : <><Plus className="h-4 w-4" /> Nuevo Cliente</>}
                    </Button>
                )}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0">
                    <div className="relative w-full max-w-lg rounded-xl bg-background p-6 shadow-lg border animate-in zoom-in-95">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>

                        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                            <h2 className="text-lg font-semibold leading-none tracking-tight">
                                {isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {isEditing ? 'Modifica los datos del cliente.' : 'Ingresa los datos del cliente para darlo de alta.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="name" className="text-right text-sm font-medium">Nombre</label>
                                <Input id="name" name="name" defaultValue={client?.name} placeholder="Juan Pérez" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="company" className="text-right text-sm font-medium">Empresa</label>
                                <Input id="company" name="company" defaultValue={client?.company || ''} placeholder="Empresa S.A." className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="email" className="text-right text-sm font-medium">Email</label>
                                <Input id="email" name="email" type="email" defaultValue={client?.email || ''} placeholder="juan@ejemplo.com" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="phone" className="text-right text-sm font-medium">Teléfono</label>
                                <Input id="phone" name="phone" defaultValue={client?.phone || ''} placeholder="55 1234 5678" className="col-span-3" />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar Cliente')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
