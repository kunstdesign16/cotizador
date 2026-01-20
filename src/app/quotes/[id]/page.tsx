import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DeleteQuoteButton from '@/components/delete-quote-button'
import { QuoteProjectManager } from '@/components/quote-project-manager'
import { BackButton } from "@/components/ui/back-button"
import { getCurrentUser } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser()
        const { prisma } = await import('@/lib/prisma')
        const { id } = await params

        const quote = await (prisma as any).quote.findUnique({
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
            } as any
        })

        if (!quote) return <div className="p-8 text-center">Cotización no encontrada</div>

        // Staff access guard
        if (user && user.role === 'staff' && quote.userId !== user.id) {
            return (
                <div className="p-8 text-center space-y-4">
                    <h1 className="text-xl font-bold text-red-600">Acceso Denegado</h1>
                    <p className="text-sm text-muted-foreground">No tienes permiso para ver esta cotización.</p>
                    <Link href="/dashboard">
                        <Button variant="outline">Volver al Dashboard</Button>
                    </Link>
                </div>
            )
        }

        const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } })
        const serializedQuote = JSON.parse(JSON.stringify(quote))

        return (
            <div className="min-h-screen bg-background p-8">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-6 flex items-center justify-between print:hidden">
                        <BackButton fallbackUrl="/dashboard" />
                    </header>

                    <QuoteProjectManager quote={serializedQuote} suppliers={suppliers} />
                </div>
            </div>
        )
    } catch (error: any) {
        console.error('Error in QuoteDetailPage:', error)
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-xl font-bold text-red-600">Error en Detalle de Cotización</h1>
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <div className="p-4 bg-muted rounded text-[10px] font-mono whitespace-pre-wrap text-left max-h-[200px] overflow-auto">
                    {error.stack}
                </div>
            </div>
        )
    }
}
