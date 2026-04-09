'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const SellerSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
})

export async function getSellers() {
    try {
        const sellers = await prisma.seller.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        return sellers;
    } catch (_error) {
        console.error("Error fetching sellers:", _error);
        return [];
    }
}

export async function createSeller(data: unknown) {
    try {
        const result = SellerSchema.safeParse(data)

        if (!result.success) {
            return {
                error: result.error.issues[0]?.message || 'Error de validación'
            }
        }

        const seller = await prisma.seller.create({
            data: result.data
        })

        revalidatePath('/sellers')
        revalidatePath('/quotes/new')
        return { success: true, seller }
    } catch (_error) {
        console.error("Error creating seller:", _error)
        return { error: 'No se pudo crear el vendedor' }
    }
}

export async function updateSeller(id: string, data: unknown) {
    try {
        const result = SellerSchema.safeParse(data)

        if (!result.success) {
            return {
                error: result.error.issues[0]?.message || 'Error de validación'
            }
        }

        const seller = await prisma.seller.update({
            where: { id },
            data: result.data
        })

        revalidatePath('/sellers')
        revalidatePath('/quotes/[id]', 'layout')
        return { success: true, seller }
    } catch (_error) {
        console.error("Error updating seller:", _error)
        return { error: 'No se pudo actualizar el vendedor' }
    }
}

export async function deleteSeller(id: string) {
    try {
        await prisma.seller.update({
            where: { id },
            data: { isActive: false }
        })

        revalidatePath('/sellers')
        revalidatePath('/quotes/new')
        return { success: true }
    } catch (_error) {
        console.error("Error deleting seller:", _error)
        return { error: 'No se pudo eliminar el vendedor' }
    }
}
