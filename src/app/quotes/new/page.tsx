import { saveQuote } from '@/actions/quotes'
import { getClients } from '@/actions/clients'
import QuoteForm from '@/components/quote-form'

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
    const { clientId } = await searchParams
    const clients = await getClients()

    // Pre-fill data if clientId is present
    let initialData = undefined
    if (clientId) {
        const selectedClient = clients.find(c => c.id === clientId)
        if (selectedClient) {
            initialData = {
                client: {
                    name: selectedClient.name,
                    company: selectedClient.company || '',
                    email: selectedClient.email || '',
                    phone: selectedClient.phone || ''
                },
                clientId: selectedClient.id,
                project: { name: '', date: new Date().toISOString().split('T')[0] },
                items: []
            }
        }
    }

    return (
        <QuoteForm
            title="Nueva Cotización (Costo + Margen)"
            action={saveQuote}
            clients={clients}
            initialData={initialData}
        />
    )
}
