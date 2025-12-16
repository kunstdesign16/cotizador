"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, FileText, Calendar, Search, Filter, Copy } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Client, Quote } from "@prisma/client"
import DeleteQuoteButton from "./delete-quote-button"
import DuplicateQuoteButton from "./duplicate-quote-button"
import { QuoteStatusSelector } from "./quote-status-selector"
import { ProjectDeliveryDate } from "./project-delivery-date"

type QuoteWithClient = Quote & { client: Client }

const STATUS_LABELS: Record<string, string> = {
    'DRAFT': 'Borrador',
    'COTIZADO': 'Cotizado',
    'PRODUCCION': 'Producción',
    'ENTREGADO': 'Entregado',
    'FACTURADO': 'Facturado',
    'COBRADO': 'Cobrado'
}

const STATUS_COLORS: Record<string, string> = {
    'DRAFT': 'bg-gray-100 text-gray-600 ring-gray-500/10',
    'COTIZADO': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'PRODUCCION': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'ENTREGADO': 'bg-purple-50 text-purple-700 ring-purple-600/20',
    'FACTURADO': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    'COBRADO': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
}

export function DashboardClient({ quotes, clients }: { quotes: QuoteWithClient[], clients: Client[] }) {
    const [search, setSearch] = useState("")
    const [selectedCompany, setSelectedCompany] = useState<string>("all")
    const [selectedStatus, setSelectedStatus] = useState<string>("all")

    // Get unique companies from clients, filtering out empty ones
    const companies = Array.from(new Set(clients.map(c => c.company).filter(Boolean))).sort()

    const filteredQuotes = quotes.filter(quote => {
        const matchesSearch = quote.project_name.toLowerCase().includes(search.toLowerCase()) ||
            quote.client.name.toLowerCase().includes(search.toLowerCase()) ||
            (quote.client.company && quote.client.company.toLowerCase().includes(search.toLowerCase()))

        const matchesCompany = selectedCompany === "all" || quote.client.company === selectedCompany
        const matchesStatus = selectedStatus === "all" || quote.status === selectedStatus
        return matchesSearch && matchesCompany && matchesStatus
    })

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border rounded-xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar proyecto o cliente..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                    >
                        <option value="all">Todas las Empresas</option>
                        {companies.map(company => (
                            <option key={company} value={company as string}>{company}</option>
                        ))}
                    </select>

                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="all">Todos los Estatus</option>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grouped Grid */}
            <div className="space-y-8">
                {filteredQuotes.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/5">
                        No se encontraron cotizaciones con los filtros actuales.
                    </div>
                ) : (
                    Array.from(new Set(filteredQuotes.map(q => q.clientId))).map(clientId => {
                        const clientQuotes = filteredQuotes.filter(q => q.clientId === clientId)
                        const client = clientQuotes[0].client

                        return (
                            <div key={clientId} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-foreground/80">{client.company || client.name}</h2>
                                    {client.company && <span className="text-sm text-muted-foreground">({client.name})</span>}
                                    <div className="h-px bg-border flex-1 ml-4" />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {clientQuotes.map((quote) => (
                                        <Link key={quote.id} href={`/quotes/${quote.id}`}>
                                            <div className="group relative rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col h-full">
                                                <div className="mb-4 flex items-start justify-between">
                                                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    {/* Status Selector - Stop Propagation explicitly */}
                                                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                        <QuoteStatusSelector id={quote.id} currentStatus={quote.status} compact />
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <h3 className="font-semibold leading-none tracking-tight">{quote.project_name}</h3>
                                                    {/* Client info is redundant here if grouped, but good for context if searched */}
                                                </div>

                                                <div className="mt-4 flex items-center justify-between text-sm pt-4 border-t">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="flex items-center text-muted-foreground text-xs">
                                                            <Calendar className="mr-1 h-3 w-3" />
                                                            {format(new Date(quote.date), 'd MMM yyyy', { locale: es })}
                                                        </span>

                                                        {/* Editable Delivery Date */}
                                                        <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                            <ProjectDeliveryDate
                                                                id={quote.id}
                                                                date={quote.deliveryDate as any}
                                                                status={quote.status}
                                                            />
                                                        </div>

                                                        <span className="font-medium text-base mt-1">
                                                            ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>

                                                    <div className="flex gap-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                        <DuplicateQuoteButton id={quote.id} iconOnly />
                                                        <DeleteQuoteButton id={quote.id} iconOnly />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
