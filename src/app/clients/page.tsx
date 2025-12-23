import { getClients } from "@/actions/clients"
import { ClientsPageClient } from "@/components/clients-page-client"

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
    try {
        const { prisma } = await import('@/lib/prisma')
        const clients = await getClients()

        // Fetch quotes for each client
        const clientsWithQuotes = await Promise.all(
            clients.map(async (client) => {
                const quotes = await (prisma as any).quote.findMany({
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
    } catch (error: any) {
        console.error('Error in ClientsPage:', error)
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-xl font-bold text-red-600">Error en Clientes</h1>
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <div className="p-4 bg-muted rounded text-[10px] font-mono whitespace-pre-wrap text-left max-h-[200px] overflow-auto">
                    {error.stack}
                </div>
            </div>
        )
    }
}
