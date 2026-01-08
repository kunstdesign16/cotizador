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
import DeleteClientButton from '@/components/delete-client-button'

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
        <div className="min-h-screen bg-background p-4 sm:p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Clientes</h1>
                        <p className="text-sm text-muted-foreground">Administra tu base de datos de clientes</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <div className="flex-1 sm:flex-none">
                            <ClientImportButton />
                        </div>
                        <div className="flex-1 sm:flex-none text-right">
                            <ClientExportButton />
                        </div>
                        <div className="w-full sm:w-auto">
                            <ClientFormDialog>
                                <Button className="gap-2 w-full justify-center">
                                    <Plus className="h-4 w-4" /> Nuevo Cliente
                                </Button>
                            </ClientFormDialog>
                        </div>
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
                                <div key={client.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                                    <div className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-4">
                                            <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                                <div className="rounded-full bg-primary/10 p-2 sm:p-3 text-primary shrink-0">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-base sm:text-lg truncate">{client.name}</h3>
                                                    {client.company && (
                                                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">{client.company}</p>
                                                    )}
                                                    <div className="mt-2 flex flex-col sm:flex-wrap sm:flex-row gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                                        {client.email && <span className="truncate">{client.email}</span>}
                                                        {client.phone && <span className="whitespace-nowrap">{client.phone}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                                                {hasQuotes && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2 text-[10px] sm:text-xs h-8"
                                                        onClick={() => toggleClient(client.id)}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                        <span className="hidden sm:inline">
                                                            {client._count?.quotes || client.quotes.length} {(client._count?.quotes || client.quotes.length) === 1 ? 'Proyecto' : 'Proyectos'}
                                                        </span>
                                                        <span className="sm:hidden">
                                                            {client._count?.quotes || client.quotes.length}
                                                        </span>
                                                    </Button>
                                                )}
                                                <Link href={`/clients/${client.id}`} className="sm:inline-block">
                                                    <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs h-8">
                                                        Ver Detalle
                                                    </Button>
                                                </Link>
                                                <DeleteClientButton id={client.id} iconOnly />
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
