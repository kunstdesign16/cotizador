import { saveQuote } from '@/actions/quotes'
import { getClients } from '@/actions/clients'
import { getSellers } from '@/actions/sellers'
import QuoteForm from '@/components/quote-form'

export const dynamic = 'force-dynamic'

export default async function NewQuotePage({
    searchParams
}: {
    searchParams: Promise<{ client?: string; projectId?: string }>
}) {
    try {
        const { client: clientId, projectId } = await searchParams
        const clients = await getClients()
        const sellers = await getSellers()

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
                sellers={sellers}
                initialData={initialData}
            />
        )
    } catch (error: any) {
        return (
            <div className="p-8 text-red-500 font-mono bg-red-50 border border-red-200 rounded-md m-8">
                <h1 className="text-xl font-bold mb-4">Error interceptado en NewQuotePage:</h1>
                <pre className="whitespace-pre-wrap">{error?.message || String(error)}</pre>
                <pre className="whitespace-pre-wrap mt-4 text-sm opacity-80">{error?.stack}</pre>
            </div>
        )
    }
}
