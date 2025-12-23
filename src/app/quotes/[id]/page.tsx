import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { ArrowLeft, Download, Printer, Pencil } from 'lucide-react'

// We need a client component to render the PDF download link because @react-pdf/renderer works on client
import QuotePDFClient from './pdf-client'
import PrintButton from './print-button'
import { QuoteStatusSelector } from '@/components/quote-status-selector'
import DeleteQuoteButton from '@/components/delete-quote-button'
import { QuoteProjectManager } from '@/components/quote-project-manager'

export const dynamic = 'force-dynamic'

// Force dynamic rendering for this page since it relies on DB data that changes 
// and we want fresh data on every request.

// Ensure we are passing only what is needed. The QuotePDFClient takes the whole quote object.
// The PDF generation inside QuoteDocument uses item.unit_cost.
// In our schema, item.unit_cost is the CLIENT price. item.internal_unit_cost is internal.
// So the PDF is safe.


export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { prisma } = await import('@/lib/prisma')
    const { id } = await params
    const quote = await prisma.quote.findUnique({
        where: { id },
        include: {
            client: true,
            items: {
                include: {
                    supplierOrder: true
                }
            },
            supplierTasks: true,
            project: true
        }
    }) as any // Workaround for TS

    if (!quote) return <div>Cotización no encontrada</div>

    const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } })
    const serializedQuote = JSON.parse(JSON.stringify(quote))

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-6xl">
                <header className="mb-6 flex items-center justify-between print:hidden">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver al Dashboard
                        </Button>
                    </Link>
                    <div className="border-l pl-2">
                        <DeleteQuoteButton id={quote.id} />
                    </div>
                </header>

                <QuoteProjectManager quote={serializedQuote} suppliers={suppliers} />
            </div>
        </div>
    )
}
