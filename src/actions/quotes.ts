'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveQuote(data: any) {
    const { prisma } = await import('@/lib/prisma')
    // data is the JSON payload from the client state
    // In a real app we should validate this with Zod again

    const { client, project, items, iva_rate, clientId } = data

    const subtotal = items.reduce((acc: number, item: any) => acc + item.subtotal, 0)
    const iva_amount = subtotal * 0.16
    const total = subtotal + iva_amount - (subtotal * Number(data.isr_rate || 0))

    let finalClientId = clientId

    if (clientId) {
        // Update existing client
        await prisma.client.update({
            where: { id: clientId },
            data: {
                name: client.name,
                company: client.company,
                email: client.email,
                phone: client.phone
            }
        })
    } else {
        // Create new client
        const newClient = await prisma.client.create({
            data: {
                name: client.name,
                company: client.company,
                email: client.email,
                phone: client.phone
            }
        })
        finalClientId = newClient.id
    }

    // 2. Create Quote
    const quote = await prisma.quote.create({
        data: {
            project_name: data.project.name,
            date: new Date(data.project.date),
            subtotal: subtotal,
            iva_rate: data.iva_rate,
            iva_amount: iva_amount,
            isr_rate: Number(data.isr_rate || 0),
            total: total,
            clientId: finalClientId,
            items: {
                create: data.items.map((item: any) => ({
                    concept: item.concept,
                    quantity: Number(item.quantity),
                    // Product Reference
                    productId: item.productId || null,
                    productCode: item.productCode || null,
                    productName: item.productName || null,
                    supplierPrice: item.supplierPrice ? Number(item.supplierPrice) : null,
                    internal_unit_cost: Number(item.internal_unit_cost || 0),
                    // Breakdown
                    cost_article: Number(item.cost_article || 0),
                    cost_workforce: Number(item.cost_workforce || 0),
                    cost_packaging: Number(item.cost_packaging || 0),
                    cost_transport: Number(item.cost_transport || 0),
                    cost_equipment: Number(item.cost_equipment || 0),
                    cost_other: Number(item.cost_other || 0),

                    profit_margin: Number(item.profit_margin || 0),
                    unit_cost: Number(item.unit_cost),
                    subtotal: Number(item.subtotal)
                }))
            }
        }
    })

    revalidatePath('/dashboard')
    return { success: true, id: quote.id }
}

export async function updateQuote(id: string, data: any) {
    const { prisma } = await import('@/lib/prisma')
    // 1. Update/Find Client (Assumption: Update the client associated with the quote)
    // Actually, modifying the client here might affect other quotes if we reused clients.
    // For now, let's just update the client info because in this MVP clients are likely 1:1 or we want to update the master record.

    // First get the quote to find the clientId
    const existingQuote = await prisma.quote.findUnique({ where: { id } })
    if (!existingQuote) return { success: false, error: 'Quote not found' }

    await prisma.client.update({
        where: { id: existingQuote.clientId },
        data: {
            name: data.client.name,
            company: data.client.company,
            email: data.client.email,
            phone: data.client.phone
        }
    })

    const subtotal = data.items.reduce((acc: number, item: any) => acc + item.subtotal, 0)
    const iva_amount = subtotal * 0.16
    const total = subtotal + iva_amount

    // 2. Update Quote & Items
    // Strategy: Delete all items and re-create.
    // Transaction makes this safe.

    const quote = await prisma.$transaction(async (tx) => {
        // Delete existing items
        await tx.quoteItem.deleteMany({
            where: { quoteId: id }
        })

        // Update Quote
        const updatedQuote = await tx.quote.update({
            where: { id },
            data: {
                project_name: data.project.name,
                date: new Date(data.project.date),
                subtotal,
                iva_rate: data.iva_rate || 0.16,
                iva_amount,
                isr_rate: Number(data.isr_rate || 0),
                total: total - (subtotal * Number(data.isr_rate || 0))
            }
        })

        // Re-create all items
        await tx.quoteItem.createMany({
            data: data.items.map((item: any) => ({
                quoteId: id,
                concept: item.concept,
                quantity: Number(item.quantity),
                // Product Reference
                productId: item.productId || null,
                productCode: item.productCode || null,
                productName: item.productName || null,
                supplierPrice: item.supplierPrice ? Number(item.supplierPrice) : null,
                internal_unit_cost: Number(item.internal_unit_cost || 0),
                // Breakdown
                cost_article: Number(item.cost_article || 0),
                cost_workforce: Number(item.cost_workforce || 0),
                cost_packaging: Number(item.cost_packaging || 0),
                cost_transport: Number(item.cost_transport || 0),
                cost_equipment: Number(item.cost_equipment || 0),
                cost_other: Number(item.cost_other || 0),

                profit_margin: Number(item.profit_margin || 0),
                unit_cost: Number(item.unit_cost),
                subtotal: Number(item.subtotal)
            }))
        })

        return updatedQuote
    })

    revalidatePath('/dashboard')
    revalidatePath(`/quotes/${id}`)
    return { success: true, id: quote.id }
}

export async function updateQuoteStatus(id: string, status: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.quote.update({
            where: { id },
            data: { status }
        })
        revalidatePath('/dashboard')
        revalidatePath(`/quotes/${id}`)
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Error modifying status' }
    }
}

export async function deleteQuote(id: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await prisma.quote.delete({
            where: { id }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Error deleting quote' }
    }
}
