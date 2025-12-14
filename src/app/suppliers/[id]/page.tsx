import { getSupplierById, deleteSupplier } from "@/actions/suppliers"
import { SupplierFormDialog } from "@/components/supplier-form-dialog"
import { ProductFormDialog } from "@/components/product-form-dialog"
import { ProductImportDialog } from "@/components/product-import-dialog"
import { ProductTable } from "@/components/product-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Pencil, Trash2, Download } from 'lucide-react'
import Link from "next/link"
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supplier = await getSupplierById(id)

    if (!supplier) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/suppliers">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">{supplier.name}</h1>
                                <SupplierFormDialog supplier={supplier}>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                </SupplierFormDialog>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {supplier._count.products} productos registrados
                            </p>
                        </div>
                    </div>

                    <form action={async () => {
                        'use server'
                        await deleteSupplier(id)
                    }}>
                        <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" /> Eliminar Proveedor
                        </Button>
                    </form>
                </header>

                {/* Products Table */}
                <section className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="font-semibold text-lg">Catálogo de Productos</h2>
                        <div className="flex gap-2">
                            <Link href={`/api/suppliers/${supplier.id}/products/export`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Exportar Excel
                                </Button>
                            </Link>
                            <ProductImportDialog supplierId={supplier.id} />
                            <ProductFormDialog supplierId={id}>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" /> Agregar Producto
                                </Button>
                            </ProductFormDialog>
                        </div>
                    </div>

                    <div className="p-6">
                        <ProductTable products={supplier.products} supplierId={id} />
                    </div>
                </section>
            </div>
        </div>
    )
}
