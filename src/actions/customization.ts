'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type CustomizationCalculationInput = {
    serviceName: string
    quantity: number
    timeInMinutes?: number
}

/**
 * Core calculation logic for customization services
 */
export async function calculateCustomizationCost(input: CustomizationCalculationInput) {
    const { serviceName, quantity, timeInMinutes = 0 } = input

    const service = await (prisma as any).customizationService.findUnique({
        where: { name: serviceName },
        include: { ranges: true }
    })

    if (!service) {
        throw new Error(`Servicio de personalización ${serviceName} no encontrado`)
    }

    // Find the matching range
    const range = service.ranges.find((r: any) => quantity >= r.minQty && quantity <= r.maxQty)

    // If no range found, use the one with the highest minQty if quantity is higher, 
    // or lowest if lower. But usually we should have exhaustive ranges.
    const effectiveRange = range || service.ranges.sort((a: any, b: any) => b.minQty - a.minQty).find((r: any) => quantity >= r.minQty)

    if (!effectiveRange) {
        throw new Error(`No se encontró un rango de costos para la cantidad ${quantity}`)
    }

    // Formula:
    // unitCost = (machineCostPerMin * time) + laborCostByRange + wearCost
    const machineCost = service.machineCostPerMin * timeInMinutes
    const laborCost = effectiveRange.laborCost
    const wearCost = service.wearCost

    const unitCost = machineCost + laborCost + wearCost

    // unitPrice = unitCost * marginMultiplier
    const marginMultiplier = 1 + (service.defaultMargin / 100)
    const unitPrice = unitCost * marginMultiplier

    // total = (unitPrice * quantity) + setupFee (solo si quantity <= 50)
    const applySetupFee = quantity <= 50
    const setupFee = applySetupFee ? service.setupFee : 0
    const totalLines = (unitPrice * quantity) + setupFee

    // We return the Breakdown for persistence in QuoteItem.costBreakdown
    const breakdown = {
        serviceId: service.id,
        serviceName: service.name,
        serviceLabel: service.label,
        quantity,
        timeInMinutes,
        machineCostPerMin: service.machineCostPerMin,
        wearCost: service.wearCost,
        laborCost: laborCost,
        setupFee: setupFee,
        unitCost: unitCost,
        margin: service.defaultMargin,
        unitPrice: unitPrice,
        total: totalLines,
        formula: "(costo_maq * tiempo) + mano_obra + desgaste"
    }

    return {
        unitCost,
        unitPrice,
        total: totalLines,
        breakdown
    }
}

/**
 * Fetch all available services for the UI
 */
export async function getCustomizationServices() {
    return (prisma as any).customizationService.findMany({
        where: { isActive: true },
        include: { ranges: { orderBy: { minQty: 'asc' } } }
    })
}

/**
 * Admin action to seed or update services
 */
export async function upsertCustomizationService(data: any) {
    const { id, name, label, machineCostPerMin, wearCost, setupFee, defaultMargin, ranges } = data

    const service = await (prisma as any).customizationService.upsert({
        where: { name: name },
        update: {
            label,
            machineCostPerMin,
            wearCost,
            setupFee,
            defaultMargin,
        },
        create: {
            name,
            label,
            machineCostPerMin,
            wearCost,
            setupFee,
            defaultMargin,
        }
    })

    // Update ranges: simple delete and recreate for this service
    if (ranges && Array.isArray(ranges)) {
        await (prisma as any).customizationRange.deleteMany({
            where: { serviceId: service.id }
        })

        await (prisma as any).customizationRange.createMany({
            data: ranges.map((r: any) => ({
                serviceId: service.id,
                minQty: r.minQty,
                maxQty: r.maxQty,
                laborCost: r.laborCost
            }))
        })
    }

    revalidatePath('/settings') // Assuming an admin settings page exists later
    return { success: true, id: service.id }
}

export async function seedCustomizationServices() {
    const defaultServices = [
        {
            name: 'LASER',
            label: 'Grabado / Corte Láser',
            machineCostPerMin: 5,
            wearCost: 2,
            setupFee: 150,
            defaultMargin: 30,
            ranges: [
                { minQty: 1, maxQty: 50, laborCost: 20 },
                { minQty: 51, maxQty: 200, laborCost: 15 },
                { minQty: 201, maxQty: 1000, laborCost: 10 },
                { minQty: 1001, maxQty: 5000, laborCost: 8 },
                { minQty: 5001, maxQty: 100000, laborCost: 6 },
            ]
        },
        {
            name: 'VINYL',
            label: 'Recorte de Vinil',
            machineCostPerMin: 3,
            wearCost: 5,
            setupFee: 100,
            defaultMargin: 35,
            ranges: [
                { minQty: 1, maxQty: 50, laborCost: 25 },
                { minQty: 51, maxQty: 200, laborCost: 18 },
                { minQty: 201, maxQty: 1000, laborCost: 12 },
                { minQty: 1001, maxQty: 5000, laborCost: 10 },
                { minQty: 5001, maxQty: 100000, laborCost: 8 },
            ]
        },
        {
            name: 'SERIGRAFIA',
            label: 'Serigrafía',
            machineCostPerMin: 0,
            wearCost: 10,
            setupFee: 250,
            defaultMargin: 40,
            ranges: [
                { minQty: 1, maxQty: 50, laborCost: 35 },
                { minQty: 51, maxQty: 200, laborCost: 25 },
                { minQty: 201, maxQty: 1000, laborCost: 15 },
                { minQty: 1001, maxQty: 5000, laborCost: 12 },
                { minQty: 5001, maxQty: 100000, laborCost: 10 },
            ]
        }
    ]

    for (const s of defaultServices) {
        await upsertCustomizationService(s)
    }

    return { success: true }
}
