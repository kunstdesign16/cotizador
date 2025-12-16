
import { ProductImportForm } from "@/components/product-import-form"
import { prisma } from "@/lib/prisma"
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { ProductExportButton } from "@/components/product-export-button"

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
    // Basic server-side fetch of count
    const suppliers = await prisma.supplier.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        }
    })

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Productos</h1>
                        <p className="text-muted-foreground">Gestiona tus proveedores y listas de precios</p>
                    </div>
                    <ProductExportButton />
                </header>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Importer Section */}
                    <div>
                        <ProductImportForm />
                    </div>

                    {/* Stats Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Proveedores Registrados</h3>
                        {suppliers.length === 0 ? (
                            <div className="text-muted-foreground text-sm italic">
                                No hay proveedores cargados aún.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {suppliers.map((sup: any) => (
                                    <div key={sup.id} className="bg-card border p-4 rounded-lg flex justify-between items-center shadow-sm">
                                        <div>
                                            <div className="font-bold">{sup.name}</div>
                                            <div className="text-xs text-muted-foreground">Actualizado: {sup.updatedAt.toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-primary">{sup._count.products}</div>
                                            <div className="text-xs text-muted-foreground">Productos</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
