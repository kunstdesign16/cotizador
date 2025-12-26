'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

interface ProductTableProps {
    products: Array<{
        id: string
        code: string
        name: string
        category: string | null
        price: number
    }>
    supplierId: string
}

export function ProductTable({ products, supplierId }: ProductTableProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredProducts = products.filter(product => {
        const query = searchQuery.toLowerCase()
        return (
            product.code.toLowerCase().includes(query) ||
            product.name.toLowerCase().includes(query) ||
            (product.category && product.category.toLowerCase().includes(query))
        )
    })

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por código, nombre o categoría..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Results Count */}
            {searchQuery && (
                <p className="text-sm text-muted-foreground">
                    {filteredProducts.length} de {products.length} productos
                </p>
            )}

            {/* Table */}
            {filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                    {searchQuery ? (
                        <p>No se encontraron productos que coincidan con &quot;{searchQuery}&quot;</p>
                    ) : (
                        <>
                            <p>No hay productos registrados para este proveedor.</p>
                            <p className="text-sm mt-2">Importa una lista de precios o agrega productos manualmente.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="p-4 font-medium">Código Hijo</th>
                                <th className="p-4 font-medium">Código Padre</th>
                                <th className="p-4 font-medium">Nombre</th>
                                <th className="p-4 font-medium">Categoría</th>
                                <th className="p-4 font-medium text-right">Precio Base</th>
                                <th className="p-4 font-medium">Tipo Precio</th>
                                <th className="p-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredProducts.map((product) => (
                                <ProductRow key={product.id} product={product} supplierId={supplierId} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// Separate component for the row to handle server actions
function ProductRow({ product, supplierId }: { product: any, supplierId: string }) {
    return (
        <tr className="hover:bg-muted/5">
            <td className="p-4 font-mono text-xs">{product.code}</td>
            <td className="p-4 font-mono text-xs text-muted-foreground">{product.parentCode || '-'}</td>
            <td className="p-4 font-medium">{product.name}</td>
            <td className="p-4 text-muted-foreground">{product.category || '-'}</td>
            <td className="p-4 text-right font-semibold">
                ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </td>
            <td className="p-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.priceType === 'ÚNICO' ? 'bg-blue-100 text-blue-700' :
                    product.priceType === 'OUTLET' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                    {product.priceType || 'NORMAL'}
                </span>
            </td>
            <td className="p-4 text-right">
                <ProductActions product={product} supplierId={supplierId} />
            </td>
        </tr>
    )
}

// Client component for actions
function ProductActions({ product, supplierId }: { product: any, supplierId: string }) {
    const { ProductFormDialog } = require('@/components/product-form-dialog')
    const { deleteProduct } = require('@/actions/products')
    const { Button } = require('@/components/ui/button')
    const { Pencil, Trash2 } = require('lucide-react')

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            await deleteProduct(product.id, supplierId)
        }
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <ProductFormDialog supplierId={supplierId} product={product}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                </Button>
            </ProductFormDialog>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                onClick={handleDelete}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
