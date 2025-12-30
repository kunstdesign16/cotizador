'use server'

import { revalidatePath } from 'next/cache'

export async function saveQuote(data: any) {
    const { prisma } = await import('@/lib/prisma')
    // data is the JSON payload from the client state
    // In a real app we should validate this with Zod again

    const { client, project: _project, items, iva_rate: _iva_rate, clientId, projectId } = data

    // VALIDATION: If projectId is provided, verify the project exists
    if (projectId) {
        const projectExists = await (prisma as any).project.findUnique({
            where: { id: projectId }
        })

        if (!projectExists) {
            return {
                success: false,
                error: 'El proyecto especificado no existe'
            }
        }
    }

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
            deliveryDate: data.project.deliveryDate ? new Date(data.project.deliveryDate) : null,
            subtotal: subtotal,
            iva_rate: data.iva_rate,
            iva_amount: iva_amount,
            isr_rate: Number(data.isr_rate || 0),
            total: total,
            clientId: finalClientId,
            projectId: projectId || null,
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

    // Revalidate paths
    revalidatePath('/dashboard')
    if (projectId) {
        revalidatePath(`/projects/${projectId}`)
    }

    return { success: true, id: quote.id }
}

export async function updateQuote(id: string, data: any) {
    const { prisma } = await import('@/lib/prisma')
    // 1. Update/Find Client (Assumption: Update the client associated with the quote)
    // Actually, modifying the client here might affect other quotes if we reused clients.
    // For now, let's just update the client info because in this MVP clients are likely 1:1 or we want to update the master record.

    // First get the quote to find the clientId and project status
    const existingQuote = await (prisma as any).quote.findUnique({
        where: { id },
        include: { project: true }
    }) as any
    if (!existingQuote) return { success: false, error: 'Quote not found' }

    // Project Status Guards
    if (existingQuote.project && existingQuote.project.financialStatus === 'CERRADO') {
        return {
            success: false,
            error: 'El proyecto está CERRADO FINANCIERAMENTE. No se permiten ediciones.'
        }
    }

    // STRICT RULE: Allow editing ONLY if Quote is DRAFT.
    // Use case: Creating a "New Version" (DRAFT) in an Active project.
    // If the quote itself is APPROVED or SENT, it should not be editable (unless reverted to draft, effectively).
    // But currently, we just check Project Status.

    const isQuoteDraft = existingQuote.status === 'DRAFT' || existingQuote.status === 'BORRADOR'

    if (!isQuoteDraft && existingQuote.project && existingQuote.project.status !== 'COTIZANDO') {
        return {
            success: false,
            error: `La cotización no está en borrador y el proyecto ya no está en etapa de cotización. No se permiten ediciones.`
        }
    }

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
                deliveryDate: data.project.deliveryDate ? new Date(data.project.deliveryDate) : null,
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

export async function getActiveProjects() {
    const { prisma } = await import('@/lib/prisma')
    try {
        const projects = await prisma.quote.findMany({
            where: {
                status: { in: ['approved'] },
                project: {
                    status: { not: 'cancelled' }
                }
            },
            select: {
                id: true,
                project_name: true,
                total: true,
                subtotal: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return projects
    } catch (_error) {
        console.error('Error:', _error)
        return []
    }
}

export async function updateQuoteStatus(id: string, status: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        const quote = await prisma.quote.update({
            where: { id },
            data: { status }
        })

        if (status === 'COBRADO') {
            await syncIncomeFromQuote(id)
        }

        revalidatePath('/dashboard')
        revalidatePath('/projects')
        if (quote.projectId) revalidatePath(`/projects/${quote.projectId}`)
        revalidatePath('/accounting')
        revalidatePath(`/quotes/${id}`)
        return { success: true }
    } catch (_error) {
        return { success: false, error: 'Error' }
    }
}

export async function approveQuote(quoteId: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        const quote = await (prisma as any).quote.findUnique({
            where: { id: quoteId },
            include: { project: true }
        }) as any

        if (!quote || !quote.projectId) return { success: false, error: 'Cotización o Proyecto no encontrado' }

        if (quote.project && quote.project.financialStatus === 'CERRADO') {
            return { success: false, error: 'El proyecto está CERRADO FINANCIERAMENTE. No se pueden aprobar cotizaciones.' }
        }

        // STRICT RULE: Cannot approve a quote if project is already ACTIVE (active) or DELIVERED (closed)
        if (quote.project.status === 'active' || quote.project.status === 'closed') {
            return { success: false, error: `El proyecto ya está ${quote.project.status}. No se puede aprobar otra cotización. Genere una Nueva Versión o Cancele la actual.` }
        }

        await prisma.$transaction([
            // 1. Mark this quote as approved and all others as not approved for this project
            prisma.quote.updateMany({
                where: { projectId: quote.projectId },
                data: { isApproved: false }
            }),
            prisma.quote.update({
                where: { id: quoteId },
                data: { isApproved: true, status: 'approved' }
            }),
            // 2. Update project status and snapshot financial totals from this quote
            (prisma as any).project.update({
                where: { id: quote.projectId },
                data: {
                    status: 'active',
                    totalCotizado: quote.total
                }
            })
        ])

        revalidatePath('/projects')
        revalidatePath(`/projects/${quote.projectId}`)
        revalidatePath(`/quotes/${quoteId}`)
        return { success: true }
    } catch (_error) {
        console.error('Error:', _error)
        return { success: false, error: 'Error' }
    }
}

async function syncIncomeFromQuote(quoteId: string) {
    const { prisma } = await import('@/lib/prisma')

    const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: { client: true }
    })

    if (!quote) return

    // Check if income exists
    const existing = await prisma.income.findFirst({
        where: { quoteId }
    })

    if (!existing) {
        await prisma.income.create({
            data: {
                description: `Cobro Proyecto: ${quote.project_name}`,
                amount: quote.total,
                iva: quote.iva_amount || 0,
                date: new Date(),
                status: 'PAID',
                clientId: quote.clientId,
                quoteId: quote.id,
                paymentMethod: 'TRANSFER' // Default, user can edit later
            }
        })
    }
}

export async function deleteQuote(id: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        const existing = await prisma.quote.findUnique({
            where: { id },
            include: { project: true }
        })

        if (existing?.project && existing.project.status !== 'draft') {
            return { success: false, error: 'No se puede eliminar una cotización de un proyecto aprobado o en ejecución.' }
        }

        await prisma.quote.delete({
            where: { id }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (_error) {
        return { success: false, error: 'Error' }
    }
}

export async function duplicateQuote(id: string) {
    const { prisma } = await import('@/lib/prisma')
    try {
        // 1. Get original quote with items
        const original = await prisma.quote.findUnique({
            where: { id },
            include: { items: true }
        })

        if (!original) return { success: false, error: 'Original quote not found' }

        // 2. Determine next version number
        let nextVersion = 1
        if (original.projectId) {
            const lastQuote = await prisma.quote.findFirst({
                where: { projectId: original.projectId },
                orderBy: { version: 'desc' },
                select: { version: true }
            })
            nextVersion = (lastQuote?.version || 0) + 1
        }

        // 3. Create new quote based on original
        const newQuote = await prisma.quote.create({
            data: {
                project_name: original.project_name,
                version: nextVersion,
                date: new Date(),
                status: 'DRAFT',
                clientId: original.clientId,
                userId: original.userId,
                projectId: original.projectId,
                isApproved: false,

                subtotal: original.subtotal,
                iva_rate: original.iva_rate,
                iva_amount: original.iva_amount,
                isr_rate: original.isr_rate,
                isr_amount: original.isr_amount,
                profit_rate: original.profit_rate,
                profit_amount: original.profit_amount,
                total: original.total,

                items: {
                    create: original.items.map(item => ({
                        concept: item.concept,
                        quantity: item.quantity,
                        productId: item.productId,
                        productCode: item.productCode,
                        productName: item.productName,
                        supplierPrice: item.supplierPrice,
                        internal_unit_cost: item.internal_unit_cost,
                        cost_article: item.cost_article,
                        cost_workforce: item.cost_workforce,
                        cost_packaging: item.cost_packaging,
                        cost_transport: item.cost_transport,
                        cost_equipment: item.cost_equipment,
                        cost_other: item.cost_other,
                        profit_margin: item.profit_margin,
                        unit_cost: item.unit_cost,
                        subtotal: item.subtotal
                    }))
                }
            }
        })

        revalidatePath('/dashboard')
        if (original.projectId) revalidatePath(`/projects/${original.projectId}`)

        return { success: true, id: newQuote.id }
    } catch (_error) {
        console.error('Error:', _error)
        return { success: false, error: 'Error' }
    }
}


export async function updateProjectDate(id: string, date: Date | null) {
    const { prisma } = await import('@/lib/prisma')
    try {
        await (prisma as any).quote.update({
            where: { id },
            data: { deliveryDate: date }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (_error) {
        return { success: false, error: 'Error' }
    }
}
