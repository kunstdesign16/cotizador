import { Button } from "@/components/ui/button"
import { getClients, deleteClient } from "@/actions/clients"
import { ClientFormDialog } from "@/components/client-form-dialog"
import { Plus, Trash2, Pencil } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ClientExportButton } from "@/components/client-export-button"
import { ClientImportButton } from "@/components/client-import-button"

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
    const clients = await getClients()

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Clientes</h1>
                        <p className="text-sm text-muted-foreground">Administra tu base de datos de clientes</p>
                    </div>
                    <div className="flex gap-2">
                        <ClientImportButton />
                        <ClientExportButton />
                        <ClientFormDialog>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Nuevo Cliente
                            </Button>
                        </ClientFormDialog>
                    </div>
                </header>

                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="p-4 font-medium">Nombre</th>
                                <th className="p-4 font-medium">Empresa</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium text-center">Proyectos</th>
                                <th className="p-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        No hay clientes registrados. Crea una cotización para agregar uno.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client) => (
                                    <tr key={client.id} className="group hover:bg-muted/5">
                                        <td className="p-4 font-medium">
                                            <Link href={`/clients/${client.id}`} className="hover:underline text-blue-600 font-semibold">
                                                {client.name}
                                            </Link>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{client.company || '-'}</td>
                                        <td className="p-4 text-muted-foreground">{client.email || '-'}</td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                {client._count.quotes}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right flex items-center justify-end gap-2">
                                            {/* Edit Action */}
                                            <ClientFormDialog client={client}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </ClientFormDialog>

                                            {/* Delete Action (Server Action Form) */}
                                            <form action={async () => {
                                                'use server'
                                                await deleteClient(client.id)
                                            }}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    )
}
