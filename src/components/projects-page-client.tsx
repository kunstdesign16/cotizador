"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { FileText, Eye } from 'lucide-react'
import { QuoteStatusSelector } from './quote-status-selector'

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

export function ProjectsPageClient({ initialQuotes }: ProjectsPageClientProps) {
    const [filter, setFilter] = useState('ALL')

    const filteredQuotes = filter === 'ALL'
        ? initialQuotes
        : initialQuotes.filter((q: any) => q.status === filter)

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
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{quote?.client?.name || 'Sin cliente'}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {new Date(quote.date).toLocaleDateString('es-MX')}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <QuoteStatusSelector id={quote.id} currentStatus={quote.status} />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Link href={`/quotes/${quote.id}`}>
                                                    <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
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
