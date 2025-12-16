'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSuppliers() {
    const suppliers = await prisma.supplier.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { name: 'asc' }
    })
    return suppliers
}

export async function createSupplier(name: string, type: string) {
    try {
        const supplier = await prisma.supplier.create({
            data: {
                name,
                type: type as any // Cast to SupplierType
            }
        })
        revalidatePath('/suppliers')
        return { success: true, supplier }
    } catch (error) {
        console.error('Error creating supplier:', error)
        return { success: false, error: 'Error al crear proveedor' }
    }
}

export async function updateSupplier(id: string, name: string, type: string) {
    try {
        const supplier = await prisma.supplier.update({
            where: { id },
            data: {
                name,
                type: type as any
            }
        })
        revalidatePath('/suppliers')
        revalidatePath(`/suppliers/${id}`)
        return { success: true, supplier }
    } catch (error) {
        console.error('Error updating supplier:', error)
        return { success: false, error: 'Error al actualizar proveedor' }
    }
}

export async function deleteSupplier(id: string) {
    try {
        await prisma.supplier.delete({
            where: { id }
        })
        revalidatePath('/suppliers')
        return { success: true }
    } catch (error) {
        console.error('Error deleting supplier:', error)
        return { success: false, error: 'Error al eliminar proveedor' }
    }
}

export async function getSupplierById(id: string) {
    const supplier = await prisma.supplier.findUnique({
        where: { id },
        include: {
            products: {
                orderBy: { name: 'asc' }
            },
            _count: {
                select: { products: true }
            },
            orders: {
                orderBy: { createdAt: 'desc' },
                take: 20
            },
            tasks: {
                orderBy: { createdAt: 'desc' },
                take: 20,
                include: {
                    quote: {
                        select: { project_name: true }
                    }
                }
            }
        }
    })
    return supplier
}
