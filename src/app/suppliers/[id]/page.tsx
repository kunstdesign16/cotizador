import { getSupplierById, deleteSupplier } from "@/actions/suppliers"
import { SupplierFormDialog } from "@/components/supplier-form-dialog"
import { ProductFormDialog } from "@/components/product-form-dialog"
import { ProductImportForm } from "@/components/product-import-form"
import { ProductTable } from "@/components/product-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Pencil, Trash2, Download } from 'lucide-react'
import Link from "next/link"
import { notFound } from 'next/navigation'
import { SupplierOrderForm } from "@/components/supplier-order-form"
import { SupplierTaskForm } from "@/components/supplier-task-form"
import { cn } from "@/lib/utils"

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

                {/* Tasks Section (Service / Finished Product) */}
                {(supplier.type === 'SERVICE' || supplier.type === 'FINISHED_PRODUCT') && (
                    <section className="bg-card border rounded-xl shadow-sm overflow-hidden mb-8">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="font-semibold text-lg">
                                {supplier.type === 'SERVICE' ? 'Tareas Asignadas' : 'Proyectos Asignados'}
                            </h2>
                            <SupplierTaskForm supplierId={supplier.id} supplierType={supplier.type}>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" /> Asignar {supplier.type === 'SERVICE' ? 'Tarea' : 'Proyecto'}
                                </Button>
                            </SupplierTaskForm>
                        </div>
                        <div className="p-0">
                            {(!supplier.tasks || supplier.tasks.length === 0) ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No hay tareas asignadas.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {supplier.tasks.map((task: any) => (
                                        <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-xs text-muted-foreground">ID: {task.id.slice(-6)}</span>
                                                    <span className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium border",
                                                        task.status === 'PENDING' && "bg-yellow-50 text-yellow-600 border-yellow-200",
                                                        task.status === 'IN_PROGRESS' && "bg-blue-50 text-blue-600 border-blue-200",
                                                        task.status === 'COMPLETED' && "bg-green-50 text-green-600 border-green-200"
                                                    )}>
                                                        {task.status === 'PENDING' && 'Pendiente'}
                                                        {task.status === 'IN_PROGRESS' && 'En Progreso'}
                                                        {task.status === 'COMPLETED' && 'Completado'}
                                                    </span>
                                                </div>
                                                <h4 className="font-medium text-sm">
                                                    {task.quote?.project_name || 'Proyecto sin nombre'}
                                                </h4>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {task.description}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm ml-4">
                                                {task.expectedDate && (
                                                    <p className="text-muted-foreground text-xs mb-1">
                                                        Entrega: {new Date(task.expectedDate).toLocaleDateString('es-MX')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Orders Section (Raw Material) */}
                {supplier.type === 'RAW_MATERIAL' && (
                    <section className="bg-card border rounded-xl shadow-sm overflow-hidden mb-8">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="font-semibold text-lg">Órdenes de Compra</h2>
                            <SupplierOrderForm supplierId={supplier.id} products={supplier.products}>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" /> Nueva Orden
                                </Button>
                            </SupplierOrderForm>
                        </div>
                        <div className="p-0">
                            {(!supplier.orders || supplier.orders.length === 0) ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No hay órdenes de compra registradas.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {supplier.orders.map((order: any) => (
                                        <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-xs text-muted-foreground">ID: {order.id.slice(-6)}</span>
                                                    <span className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium border",
                                                        order.status === 'PENDING' && "bg-yellow-50 text-yellow-600 border-yellow-200",
                                                        order.status === 'ORDERED' && "bg-blue-50 text-blue-600 border-blue-200",
                                                        order.status === 'RECEIVED' && "bg-green-50 text-green-600 border-green-200"
                                                    )}>
                                                        {order.status === 'PENDING' && 'Pendiente'}
                                                        {order.status === 'ORDERED' && 'Ordenado'}
                                                        {order.status === 'RECEIVED' && 'Recibido'}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium">
                                                    {order.items.length} productos
                                                    <span className="text-muted-foreground font-normal mx-1">•</span>
                                                    {new Date(order.createdAt).toLocaleDateString('es-MX')}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm">
                                                {order.expectedDate && (
                                                    <p className="text-muted-foreground text-xs mb-1">
                                                        Espera: {new Date(order.expectedDate).toLocaleDateString('es-MX')}
                                                    </p>
                                                )}
                                                {/* Actions like status change could go here */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

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
                            <ProductImportForm supplierId={supplier.id} supplierName={supplier.name} />
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
