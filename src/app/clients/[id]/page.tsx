import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, FileText, Pencil } from "lucide-react"
import Link from "next/link"
import { notFound } from 'next/navigation'
import { ClientFormDialog } from "@/components/client-form-dialog"

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
    const { prisma } = await import('@/lib/prisma')
    const { id } = params
    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            quotes: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!client) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/clients">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">{client.name}</h1>
                                const serializedClient = JSON.parse(JSON.stringify(client))

                                return (
                                <div className="min-h-screen bg-background p-8">
                                    <div className="mx-auto max-w-6xl space-y-8">
                                        <header className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Link href="/clients">
                                                    <Button variant="ghost" size="icon">
                                                        <ArrowLeft className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h1 className="text-2xl font-bold">{client.name}</h1>
                                                        <ClientFormDialog client={serializedClient}>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                        </ClientFormDialog>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{client.company || 'Sin Empresa'}</p>
                                                </div>
                                            </div>

                                            <Link href={`/quotes/new?clientId=${client.id}`}>
                                                <Button className="gap-2">
                                                    <Plus className="h-4 w-4" /> Nueva Cotización
                                                </Button>
                                            </Link>
                                        </header>

                                        <div className="grid gap-6 md:grid-cols-3">
                                            {/* Sidebar / Info */}
                                            <div className="space-y-6">
                                                <section className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
                                                    <h2 className="font-semibold border-b pb-2">Datos de Contacto</h2>
                                                    <div className="space-y-2 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground block text-xs uppercase">Email</span>
                                                            <span>{client.email || '-'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground block text-xs uppercase">Teléfono</span>
                                                            <span>{client.phone || '-'}</span>
                                                        </div>
                                                    </div>
                                                </section>
                                            </div>

                                            {/* Main Content / History */}
                                            <div className="md:col-span-2 space-y-6">
                                                <section className="bg-card rounded-xl border shadow-sm overflow-hidden">
                                                    <div className="p-6 border-b flex justify-between items-center">
                                                        <h2 className="font-semibold">Historial de Cotizaciones</h2>
                                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                                            {client.quotes.length} Total
                                                        </span>
                                                    </div>

                                                    {client.quotes.length === 0 ? (
                                                        <div className="p-12 text-center text-muted-foreground">
                                                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                                            <p>No hay cotizaciones para este cliente.</p>
                                                            <Link href={`/quotes/new?clientId=${client.id}`} className="text-primary hover:underline mt-2 inline-block">
                                                                Crear la primera
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <div className="divide-y">
                                                            {client.quotes.map(quote => (
                                                                <div key={quote.id} className="p-4 flex items-center justify-between hover:bg-muted/5 group transition-colors">
                                                                    <div>
                                                                        <div className="font-medium text-lg">{quote.project_name}</div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {new Date(quote.date).toLocaleDateString('es-MX')}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right flex items-center gap-4">
                                                                        <div>
                                                                            <div className="font-bold">${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                                                                            <div className="text-xs text-muted-foreground uppercase">{quote.status}</div>
                                                                        </div>
                                                                        <Link href={`/quotes/${quote.id}`}>
                                                                            <Button variant="outline" size="sm">Ver</Button>
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </section>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                )
}
