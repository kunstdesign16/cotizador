"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Calendar, Search, ChevronDown, ChevronRight, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Client, Quote } from "@prisma/client"
import DeleteQuoteButton from "./delete-quote-button"
import DuplicateQuoteButton from "./duplicate-quote-button"
import { QuoteStatusSelector } from "./quote-status-selector"
import { ProjectDeliveryDate } from "./project-delivery-date"
import PaymentDialog from "./payment-dialog"
import { DollarSign } from "lucide-react"

type QuoteWithClient = Quote & {
    client: Client,
    expenses: any[],
    items: any[],
    project: any
}

const STATUS_LABELS: Record<string, string> = {
    'draft': 'Borrador',
    'approved': 'Aprobado',
    'rejected': 'Rechazado',
    'replaced': 'Reemplazado'
}



export function DashboardClient({ quotes, clients, suppliers }: {
    quotes: QuoteWithClient[],
    clients: Client[],
    suppliers: { id: string, name: string }[]
}) {
    const [search, setSearch] = useState("")
    const [selectedCompany, setSelectedCompany] = useState<string>("all")
    const [selectedStatus, setSelectedStatus] = useState<string>("all")
    const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

    // Payment Dialog state
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
    const [selectedQuote, setSelectedQuote] = useState<QuoteWithClient | null>(null)

    const router = useRouter()

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

    const toggleClient = (clientId: string) => {
        const newExpanded = new Set(expandedClients)
        if (newExpanded.has(clientId)) {
            newExpanded.delete(clientId)
        } else {
            newExpanded.add(clientId)
        }
        setExpandedClients(newExpanded)
    }

    const expandAll = () => {
        const allIds = Array.from(new Set(filteredQuotes.map(q => q.clientId)))
        setExpandedClients(new Set(allIds))
    }

    const collapseAll = () => {
        setExpandedClients(new Set())
    }

    // Group quotes by client
    const clientGroups = Array.from(new Set(filteredQuotes.map(q => q.clientId))).map(clientId => {
        const clientQuotes = filteredQuotes.filter(q => q.clientId === clientId)
        const client = clientQuotes[0].client
        const totalAmount = clientQuotes.reduce((sum, q) => sum + q.total, 0)
        return { clientId, client, quotes: clientQuotes, totalAmount }
    })

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col gap-4 p-4 bg-card border rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar proyecto o cliente..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex-1 sm:flex-none"
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                        >
                            <option value="all">Todas las Empresas</option>
                            {companies.map(company => (
                                <option key={company} value={company as string}>{company}</option>
                            ))}
                        </select>

                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex-1 sm:flex-none"
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
                {/* Expand/Collapse Controls */}
                <div className="flex gap-2 text-xs">
                    <button
                        onClick={expandAll}
                        className="text-primary hover:underline"
                    >
                        Expandir todos
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                        onClick={collapseAll}
                        className="text-primary hover:underline"
                    >
                        Colapsar todos
                    </button>
                </div>
            </div>

            {/* Collapsible Client Groups */}
            <div className="space-y-4">
                {filteredQuotes.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/5">
                        No se encontraron cotizaciones con los filtros actuales.
                    </div>
                ) : (
                    clientGroups.map(({ clientId, client, quotes: clientQuotes, totalAmount }) => {
                        const isExpanded = expandedClients.has(clientId)

                        return (
                            <div key={clientId} className="border rounded-xl bg-card shadow-sm overflow-hidden">
                                {/* Collapsible Header */}
                                <button
                                    onClick={() => toggleClient(clientId)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        )}
                                        <div>
                                            <h2 className="text-lg font-bold text-foreground">
                                                {client.company || client.name}
                                            </h2>
                                            {client.company && (
                                                <span className="text-sm text-muted-foreground">{client.name}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                            {clientQuotes.length} proyecto{clientQuotes.length !== 1 ? 's' : ''}
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </button>

                                {/* Collapsible Content */}
                                {isExpanded && (
                                    <div className="border-t p-4">
                                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                            {clientQuotes.map((quote) => (
                                                <Link key={quote.id} href={`/quotes/${quote.id}`}>
                                                    <div className="group relative rounded-xl border border-border bg-background p-4 sm:p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col h-full">
                                                        <div className="mb-4 flex items-start justify-between">
                                                            <div className="rounded-full bg-primary/10 p-2 text-primary">
                                                                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                                            </div>
                                                            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                                <QuoteStatusSelector
                                                                    id={quote.id}
                                                                    currentStatus={quote.status}
                                                                    compact
                                                                    disabled={quote.project?.status !== 'draft'}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex-1">
                                                            <h3 className="font-semibold leading-none tracking-tight text-sm sm:text-base">{quote.project_name}</h3>
                                                        </div>

                                                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm pt-4 border-t gap-2">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="flex items-center text-muted-foreground text-xs">
                                                                    <Calendar className="mr-1 h-3 w-3" />
                                                                    {format(new Date(quote.date), 'd MMM yyyy', { locale: es })}
                                                                </span>

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

                                                                {/* Progress Bar */}
                                                                <div className="mt-2 space-y-1">
                                                                    {(() => {
                                                                        const totalPaid = quote.expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0;
                                                                        const totalCost = quote.items?.reduce((sum: number, i: any) => sum + (Number(i.internal_unit_cost) || Number(i.unit_cost) || 0) * (i.quantity || 1), 0) || 0;
                                                                        const progress = totalCost > 0 ? (totalPaid / totalCost) * 100 : 0;

                                                                        return (
                                                                            <>
                                                                                <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
                                                                                    <span>Pagos Proveedores</span>
                                                                                    <span>{progress.toFixed(0)}%</span>
                                                                                </div>
                                                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                                                    <div
                                                                                        className={`h-full transition-all ${progress >= 100 ? 'bg-emerald-500' : progress > 0 ? 'bg-blue-500' : 'bg-muted'}`}
                                                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                                                    />
                                                                                </div>
                                                                                <div className="text-[10px] text-muted-foreground text-right italic">
                                                                                    ${totalPaid.toLocaleString('es-MX')} / ${totalCost.toLocaleString('es-MX')}
                                                                                </div>
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                                {quote.project?.status === 'draft' && (
                                                                    <>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                            onClick={() => router.push(`/quotes/${quote.id}/edit`)}
                                                                            title="Editar Cotización"
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                        <DuplicateQuoteButton id={quote.id} iconOnly />
                                                                        <DeleteQuoteButton id={quote.id} iconOnly />
                                                                    </>
                                                                )}

                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                    onClick={() => {
                                                                        setSelectedQuote(quote);
                                                                        setPaymentDialogOpen(true);
                                                                    }}
                                                                    title="Registrar Pago"
                                                                >
                                                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                                                </Button>
                                                            </div>
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

            {selectedQuote && (
                <PaymentDialog
                    open={paymentDialogOpen}
                    setOpen={setPaymentDialogOpen}
                    quoteId={selectedQuote.id}
                    orderTotal={selectedQuote.items?.reduce((sum, i) => sum + (i.internal_unit_cost || 0) * (i.quantity || 1), 0) || 0}
                    suppliers={suppliers}
                />
            )}
        </div>
    )
}
