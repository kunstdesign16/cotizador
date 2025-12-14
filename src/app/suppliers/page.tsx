import { getSuppliers } from "@/actions/suppliers"
import { SupplierFormDialog } from "@/components/supplier-form-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Package, ChevronRight } from 'lucide-react'
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function SuppliersPage() {
    const suppliers = await getSuppliers()

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
                        <p className="text-muted-foreground">Gestiona tus proveedores y sus catálogos de productos</p>
                    </div>
                    <SupplierFormDialog>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Nuevo Proveedor
                        </Button>
                    </SupplierFormDialog>
                </header>

                {suppliers.length === 0 ? (
                    <div className="bg-card border rounded-xl p-12 text-center">
                        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <h3 className="text-lg font-semibold mb-2">No hay proveedores registrados</h3>
                        <p className="text-muted-foreground mb-4">Comienza agregando tu primer proveedor</p>
                        <SupplierFormDialog>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" /> Crear Proveedor
                            </Button>
                        </SupplierFormDialog>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {suppliers.map((supplier: any) => (
                            <Link
                                key={supplier.id}
                                href={`/suppliers/${supplier.id}`}
                                className="group"
                            >
                                <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                                {supplier.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Actualizado: {new Date(supplier.updatedAt).toLocaleDateString('es-MX')}
                                            </p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Package className="h-4 w-4 text-primary" />
                                        <span className="font-semibold text-primary">{supplier._count.products}</span>
                                        <span className="text-muted-foreground">productos</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
