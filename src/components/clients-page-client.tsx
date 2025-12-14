'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Plus, User, FileText, ChevronDown, ChevronRight, Calendar } from 'lucide-react'
import { ClientFormDialog } from '@/components/client-form-dialog'
import { ClientExportButton } from '@/components/client-export-button'
import { ClientImportButton } from '@/components/client-import-button'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function ClientsPageClient({ clients }: { clients: any[] }) {
    const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

    const toggleClient = (clientId: string) => {
        const newExpanded = new Set(expandedClients)
        if (newExpanded.has(clientId)) {
            newExpanded.delete(clientId)
        } else {
            newExpanded.add(clientId)
        }
        setExpandedClients(newExpanded)
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Clientes</h1>
                        <p className="text-sm text-muted-foreground">Administra tu base de datos de clientes</p>
                    </div>
                    <div className="flex gap-2">
                        <ClientImportButton />
                        <ClientExportButton />
                        <ClientFormDialog>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Nuevo Cliente
                            </Button>
                        </ClientFormDialog>
                    </div>
                </header>

                <div className="space-y-4">
                    {clients.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/5">
                            No hay clientes registrados aún.
                        </div>
                    ) : (
                        clients.map((client) => {
                            const isExpanded = expandedClients.has(client.id)
                            const hasQuotes = client.quotes && client.quotes.length > 0

                            return (
                                <div key={client.id} className="rounded-xl border border-border bg-card shadow-sm">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="rounded-full bg-primary/10 p-3 text-primary">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg">{client.name}</h3>
                                                    {client.company && (
                                                        <p className="text-sm text-muted-foreground mt-1">{client.company}</p>
                                                    )}
                                                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                        {client.email && <span>{client.email}</span>}
                                                        {client.phone && <span>{client.phone}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {hasQuotes && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => toggleClient(client.id)}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                        {client._count?.quotes || client.quotes.length} {(client._count?.quotes || client.quotes.length) === 1 ? 'Proyecto' : 'Proyectos'}
                                                    </Button>
                                                )}
                                                <Link href={`/clients/${client.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        Ver Detalle
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Quote List */}
                                    {isExpanded && hasQuotes && (
                                        <div className="border-t bg-muted/20 p-4">
                                            <div className="space-y-2">
                                                {client.quotes.map((quote: any) => (
                                                    <Link
                                                        key={quote.id}
                                                        href={`/quotes/${quote.id}`}
                                                        className="block p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                                <div>
                                                                    <p className="font-medium text-sm">{quote.project_name}</p>
                                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {format(new Date(quote.date), 'd MMM yyyy', { locale: es })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex flex-col gap-1">
                                                                <p className="font-semibold text-sm">
                                                                    ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                                </p>
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                                    {quote.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
