
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function searchProducts(query: string) {
    if (!query || query.length < 2) return []

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { code: { contains: query, mode: 'insensitive' } }
            ]
        },
        take: 20,
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
    } catch (error) {
        console.error('Error creating product:', error)
        return { success: false, error: 'Error al crear producto' }
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
    } catch (error) {
        console.error('Error updating product:', error)
        return { success: false, error: 'Error al actualizar producto' }
    }
}

export async function deleteProduct(id: string, supplierId: string) {
    try {
        await prisma.product.delete({
            where: { id }
        })
        revalidatePath(`/suppliers/${supplierId}`)
        return { success: true }
    } catch (error) {
        console.error('Error deleting product:', error)
        return { success: false, error: 'Error al eliminar producto' }
    }
}
