
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function searchProducts(query: string) {
    if (!query || query.length < 2) return []

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { code: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } }
            ]
        },
        take: 20,
        orderBy: { name: 'asc' }
    })

    return products
}

export async function getProductsBySupplier(supplierId: string) {
    const products = await prisma.product.findMany({
        where: { supplierId },
        orderBy: { name: 'asc' }
    })
    return products
}

export async function createProduct(supplierId: string, data: {
    code: string
    name: string
    category?: string
    price: number
}) {
    try {
        const product = await prisma.product.create({
            data: {
                ...data,
                category: data.category || null,
                supplierId
            }
        })
        revalidatePath(`/suppliers/${supplierId}`)
        return { success: true, product }
    } catch (_error) {
        console.error('Error creating product:', _error)
        return { success: false, error: 'Error' }
    }
}

export async function updateProduct(id: string, data: {
    code: string
    name: string
    category?: string
    price: number
}) {
    try {
        const product = await prisma.product.update({
            where: { id },
            data: {
                ...data,
                category: data.category || null
            }
        })
        revalidatePath(`/suppliers/${product.supplierId}`)
        return { success: true, product }
    } catch (_error) {
        console.error('Error updating product:', _error)
        return { success: false, error: 'Error' }
    }
}

export async function deleteProduct(id: string, supplierId: string) {
    try {
        await prisma.product.delete({
            where: { id }
        })
        revalidatePath(`/suppliers/${supplierId}`)
        return { success: true }
    } catch (_error) {
        console.error('Error deleting product:', _error)
        return { success: false, error: 'Error' }
    }
}

export async function exportProductsToCSV() {
    const products = await prisma.product.findMany({
        include: { supplier: true },
        orderBy: { name: 'asc' }
    })

    // Generate CSV Header
    const headers = ['Código', 'Nombre', 'Categoría', 'Precio', 'Proveedor', 'Fecha Actualización']

    // Generate Rows
    const rows = products.map(p => [
        p.code,
        p.name,
        p.category || '',
        p.price.toString(),
        p.supplier.name,
        p.updatedAt.toISOString().split('T')[0]
    ])

    // Combine
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    return csvContent
}

export async function deleteAllProductsBySupplier(supplierId: string) {
    try {
        await prisma.product.deleteMany({
            where: { supplierId }
        })
        revalidatePath(`/suppliers/${supplierId}`)
        return { success: true }
    } catch (_error) {
        console.error('Error deleting all products:', _error)
        return { success: false, error: 'Error al borrar los productos' }
    }
}
