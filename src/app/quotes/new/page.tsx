import { saveQuote } from '@/actions/quotes'
import { getClients } from '@/actions/clients'
import QuoteForm from '@/components/quote-form'

export const dynamic = 'force-dynamic'

export default async function NewQuotePage({
    searchParams
}: {
    searchParams: Promise<{ client?: string; projectId?: string }>
}) {
    const { client: clientId, projectId } = await searchParams
    const clients = await getClients()

    // Pre-fill data if clientId or projectId is present
    let initialData = undefined
    let projectName = ''

    // If projectId is provided, fetch project data
    if (projectId) {
        const { prisma } = await import('@/lib/prisma')
        const project = await (prisma as any).project.findUnique({
            where: { id: projectId },
            include: { client: true }
        })

        if (project) {
            projectName = project.name
            initialData = {
                client: {
                    name: project.client.name,
                    company: project.client.company || '',
                    email: project.client.email || '',
                    phone: project.client.phone || ''
                },
                clientId: project.client.id,
                projectId: project.id,
                project: {
                    name: project.name,
                    date: new Date().toISOString().split('T')[0]
                },
                items: []
            }
        }
    } else if (clientId) {
        // Existing client pre-fill logic
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

    const serializedClients = JSON.parse(JSON.stringify(clients))

    return (
        <QuoteForm
            title={projectId ? `Nueva Cotización - ${projectName}` : "Nueva Cotización (Costo + Margen)"}
            action={saveQuote}
            clients={serializedClients}
            initialData={initialData}
        />
    )
}
