import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { DashboardClient } from '@/components/dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const quotes = await prisma.quote.findMany({
        include: { client: true },
        orderBy: { updatedAt: 'desc' }
    })

    const clients = await prisma.client.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
                        <p className="text-muted-foreground">Gestiona tus cotizaciones recientes</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/quotes/new">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nueva Cotización
                            </Button>
                        </Link>
                        <Link href="/clients">
                            <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Clientes
                            </Button>
                        </Link>
                    </div>
                </header>

                <DashboardClient quotes={quotes as any} clients={clients} />
            </div>
        </div>
    )
}
