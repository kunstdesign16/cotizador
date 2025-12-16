"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { FileText, Eye } from 'lucide-react'

interface ProjectsPageClientProps {
    initialQuotes: any[]
}

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Todos' },
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'SAVED', label: 'Guardado' },
    { value: 'SENT', label: 'Enviado' },
    { value: 'APPROVED', label: 'Aprobado' },
    { value: 'FACTURADO', label: 'Facturado' },
    { value: 'COBRADO', label: 'Cobrado' }
]

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
    SAVED: 'bg-blue-100 text-blue-800 border-blue-200',
    SENT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    FACTURADO: 'bg-purple-100 text-purple-800 border-purple-200',
    COBRADO: 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

export function ProjectsPageClient({ initialQuotes }: ProjectsPageClientProps) {
    const [quotes, setQuotes] = useState(initialQuotes)
    const [filter, setFilter] = useState('ALL')

    const filteredQuotes = filter === 'ALL'
        ? quotes
        : quotes.filter((q: any) => q.status === filter)

    const handleStatusChange = async (quoteId: string, newStatus: string) => {
        // Optimistic update
        setQuotes(quotes.map((q: any) =>
            q.id === quoteId ? { ...q, status: newStatus } : q
        ))

        try {
            const response = await fetch(`/api/quotes/${quoteId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) {
                // Revert on error
                setQuotes(initialQuotes)
                alert('Error al actualizar el estatus')
            }
        } catch (error) {
            setQuotes(initialQuotes)
            alert('Error al actualizar el estatus')
        }
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
                        <p className="text-muted-foreground">Gestión de cotizaciones y estatus</p>
                    </div>
                    <Link href="/quotes/new">
                        <Button className="gap-2">
                            <FileText className="h-4 w-4" /> Nueva Cotización
                        </Button>
                    </Link>
                </header>

                {/* Status Filter */}
                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => (
                        <Button
                            key={status.value}
                            variant={filter === status.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(status.value)}
                        >
                            {status.label}
                        </Button>
                    ))}
                </div>

                {/* Projects Table */}
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    {filteredQuotes.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            No hay proyectos en esta vista.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Proyecto</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Estatus</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredQuotes.map((quote: any) => (
                                        <tr key={quote.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3 font-medium">{quote.project_name}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{quote.client.name}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {new Date(quote.date).toLocaleDateString('es-MX')}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={quote.status}
                                                    onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                                                    className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[quote.status] || 'bg-gray-100'}`}
                                                >
                                                    {STATUS_OPTIONS.filter(s => s.value !== 'ALL').map((status) => (
                                                        <option key={status.value} value={status.value}>
                                                            {status.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Link href={`/quotes/${quote.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
