import { getSupplierById, deleteSupplier } from "@/actions/suppliers"
import { deleteProduct } from "@/actions/products"
import { SupplierFormDialog } from "@/components/supplier-form-dialog"
import { ProductFormDialog } from "@/components/product-form-dialog"
import { ProductImportForm } from "@/components/product-import-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Pencil, Trash2, Upload } from 'lucide-react'
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

                {/* Import Section */}
                <section className="bg-card border rounded-xl p-6 shadow-sm">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Importar Lista de Precios
                    </h2>
                    <ProductImportForm supplierId={id} supplierName={supplier.name} />
                </section>

                {/* Products Table */}
                <section className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="font-semibold text-lg">Catálogo de Productos</h2>
                        <ProductFormDialog supplierId={id}>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" /> Agregar Producto
                            </Button>
                        </ProductFormDialog>
                    </div>

                    {supplier.products.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <p>No hay productos registrados para este proveedor.</p>
                            <p className="text-sm mt-2">Importa una lista de precios o agrega productos manualmente.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="p-4 font-medium">Código</th>
                                        <th className="p-4 font-medium">Nombre</th>
                                        <th className="p-4 font-medium">Categoría</th>
                                        <th className="p-4 font-medium text-right">Precio</th>
                                        <th className="p-4 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {supplier.products.map((product: any) => (
                                        <tr key={product.id} className="hover:bg-muted/5">
                                            <td className="p-4 font-mono text-xs">{product.code}</td>
                                            <td className="p-4 font-medium">{product.name}</td>
                                            <td className="p-4 text-muted-foreground">{product.category || '-'}</td>
                                            <td className="p-4 text-right font-semibold">
                                                ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 text-right flex items-center justify-end gap-2">
                                                <ProductFormDialog supplierId={id} product={product}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </ProductFormDialog>
                                                <form action={async () => {
                                                    'use server'
                                                    await deleteProduct(product.id, id)
                                                }}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
