import { updateQuote } from '@/actions/quotes'
import { getClients } from '@/actions/clients'
import QuoteForm, { QuoteFormData } from '@/components/quote-form'
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
    const { prisma } = await import('@/lib/prisma')
    const { id } = await params
    const [quote, clients] = await Promise.all([
        prisma.quote.findUnique({
            where: { id },
            include: {
                client: true,
                items: true
            }
        }),
        getClients()
    ])

    if (!quote) {
        notFound()
    }

    // Transform to Form Data
    const formData: QuoteFormData = {
        client: {
            name: quote.client.name,
            company: quote.client.company || '',
            email: quote.client.email || '',
            phone: quote.client.phone || ''
        },
        clientId: quote.clientId,
        project: {
            name: quote.project_name,
            date: quote.createdAt.toISOString().split('T')[0]
        },
        isr_rate: quote.isr_rate,
        items: quote.items.map(item => ({
            id: item.id,
            concept: item.concept,
            quantity: item.quantity,
            internal_unit_cost: item.internal_unit_cost,
            cost_article: item.cost_article,
            cost_workforce: item.cost_workforce,
            cost_packaging: item.cost_packaging,
            cost_transport: item.cost_transport,
            cost_equipment: item.cost_equipment,
            cost_other: item.cost_other,
            profit_margin: item.profit_margin,
            unit_cost: item.unit_cost,
            subtotal: item.subtotal
        }))
    }

    // We need to bind the ID to the server action
    const updateQuoteWithId = updateQuote.bind(null, id)

    const serializedClients = JSON.parse(JSON.stringify(clients))

    return (
        <QuoteForm
            title="Editar Cotización"
            initialData={formData}
            clients={serializedClients}
            action={updateQuoteWithId}
        />
    )
}
