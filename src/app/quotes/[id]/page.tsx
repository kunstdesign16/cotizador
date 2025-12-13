import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { ArrowLeft, Download, Printer, Pencil } from 'lucide-react'
// import { QuoteDocument } from '@/lib/pdf'
// import dynamic from 'next/dynamic'

// We need a client component to render the PDF download link because @react-pdf/renderer works on client
import QuotePDFClient from './pdf-client'
import PrintButton from './print-button'
import { QuoteStatusSelector } from '@/components/quote-status-selector'
import DeleteQuoteButton from '@/components/delete-quote-button'

export const dynamic = 'force-dynamic'

// Force dynamic rendering for this page since it relies on DB data that changes 
// and we want fresh data on every request.

// Ensure we are passing only what is needed. The QuotePDFClient takes the whole quote object.
// The PDF generation inside QuoteDocument uses item.unit_cost.
// In our schema, item.unit_cost is the CLIENT price. item.internal_unit_cost is internal.
// So the PDF is safe.


export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const quote = await prisma.quote.findUnique({
        where: { id },
        include: { client: true, items: true }
    }) as any // Workaround for TS

    if (!quote) return <div>Cotización no encontrada</div>

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <header className="flex items-center justify-between print:hidden">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        {/* Status Selector */}
                        <div className="mr-4 border-r pr-4">
                            <QuoteStatusSelector id={quote.id} currentStatus={quote.status} />
                        </div>

                        <QuotePDFClient quote={quote} />
                        <Link href={`/quotes/${quote.id}/edit`}>
                            <Button variant="outline">
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                            </Button>
                        </Link>
                        <PrintButton />
                        <div className="ml-2 border-l pl-2">
                            <DeleteQuoteButton id={quote.id} />
                        </div>
                    </div>
                </header>

                <div className="rounded-xl border border-border bg-card p-8 shadow-sm print:shadow-none print:border-none">
                    {/* HTML Preview matches PDF roughly */}
                    <div className="mb-8 flex justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Cotización</h1>
                            <p className="text-muted-foreground">Folio: {quote.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-lg">Kunst & Design</div>
                            <div className="text-sm text-muted-foreground">{new Date(quote.date).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="mb-8 p-4 bg-muted/30 rounded-lg">
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Cliente</h3>
                        <div className="text-lg font-medium">{quote.client.name}</div>
                        <div>{quote.client.company}</div>
                        <div className="text-sm text-muted-foreground">{quote.client.email}</div>
                    </div>

                    <div className="mb-12">
                        <h3 className="font-semibold text-lg mb-4">{quote.project_name}</h3>
                        <table className="w-full text-sm">
                            <thead className="border-b">
                                <tr className="text-left">
                                    <th className="py-2">Concepto</th>
                                    <th className="py-2 w-24">Cant.</th>
                                    <th className="py-2 w-32 text-right">P. Unit</th>
                                    <th className="py-2 w-32 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {quote.items.map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="py-3">{item.concept}</td>
                                        <td className="py-3">{item.quantity}</td>
                                        <td className="py-3 text-right">${item.unit_cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                        <td className="py-3 text-right font-medium">${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${quote.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">IVA (16%)</span>
                                <span>${quote.iva_amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
