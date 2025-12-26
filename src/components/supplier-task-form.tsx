'use client'

import { useState, useEffect } from 'react'
import { X, ClipboardList } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createSupplierTask } from '@/actions/supplier-tasks'
import { useRouter } from 'next/navigation'

interface SupplierTaskFormProps {
    supplierId: string
    supplierType: string
    projects: any[]
    children?: React.ReactNode
}

// Unused QuoteSummary removed

export function SupplierTaskForm({ supplierId, supplierType, projects = [], children }: SupplierTaskFormProps) {
    const [open, setOpen] = useState(false)
    const [selectedQuote, setSelectedQuote] = useState('')
    const [description, setDescription] = useState('')
    const [expectedDate, setExpectedDate] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (open) {
            // Placeholder for fetching quotes. 
            // In a real implementation this would fetch from an endpoint or server action.
            // For now we just allow entering the ID manually as per previous code structure.
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedQuote || !description) return

        setLoading(true)
        try {
            const date = expectedDate ? new Date(expectedDate + 'T12:00:00') : undefined
            const result = await createSupplierTask(supplierId, selectedQuote, description, date)

            if (result.success) {
                setOpen(false)
                setDescription('')
                setExpectedDate('')
                setSelectedQuote('')
                router.refresh()
            } else {
                alert(result.error)
            }
        } catch {
            alert('Error al crear tarea')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {children}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-background rounded-xl border shadow-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" />
                                {supplierType === 'SERVICE' ? 'Asignar Servicio' : 'Asignar Proyecto'}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Relacionar con Proyecto / Cotización</label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={selectedQuote}
                                    onChange={(e) => setSelectedQuote(e.target.value)}
                                >
                                    <option value="">-- Seleccionar Proyecto --</option>
                                    {projects.map((p: any) => (
                                        <option key={p.id} value={p.id}>
                                            {p.project_name} - {p.client.company || p.client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Descripción / Instrucciones</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detalles del trabajo a realizar..."
                                    rows={4}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Fecha Entrega Esperada</label>
                                <Input
                                    type="date"
                                    value={expectedDate}
                                    onChange={(e) => setExpectedDate(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading || !selectedQuote || !description}>
                                    {loading ? 'Asignando...' : 'Asignar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
