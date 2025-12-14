import { getClients } from "@/actions/clients"
import { ClientsPageClient } from "@/components/clients-page-client"

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
    const clients = await getClients()

    // Fetch quotes for each client
    const { prisma } = await import('@/lib/prisma')
    const clientsWithQuotes = await Promise.all(
        clients.map(async (client) => {
            const quotes = await prisma.quote.findMany({
                where: { clientId: client.id },
                orderBy: { date: 'desc' },
                take: 10 // Limit to 10 most recent quotes
            })
            return {
                ...client,
                quotes: JSON.parse(JSON.stringify(quotes))
            }
        })
    )

    const serializedClients = JSON.parse(JSON.stringify(clientsWithQuotes))

    return <ClientsPageClient clients={serializedClients} />
}
