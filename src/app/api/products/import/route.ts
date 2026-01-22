
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Prevent static generation + long timeout
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Enable long-running if on Vercel Pro, otherwise limits apply

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { products, supplierId, supplierName } = body as {
            products: any[]
            supplierId?: string
            supplierName?: string
        }

        if (!products || !Array.isArray(products)) {
            return NextResponse.json({ success: false, message: 'No software provided' }, { status: 400 })
        }

        // 1. Get or Create Supplier (only on first chunk if needed, but handled simple here)
        let finalSupplierId = supplierId

        if (!finalSupplierId && supplierName) {
            const name = supplierName || 'Proveedor General'
            let supplier = await prisma.supplier.findFirst({
                where: { name }
            })

            if (!supplier) {
                supplier = await prisma.supplier.create({
                    data: { name }
                })
            }
            finalSupplierId = supplier.id
        }

        if (!finalSupplierId) {
            return NextResponse.json({ success: false, message: 'Falta información del proveedor' }, { status: 400 })
        }

        console.log(`Processing batch of ${products.length} products for supplier ${finalSupplierId}...`)

        // 2. Parallel Upsert for the batch
        await Promise.all(products.map(p =>
            prisma.product.upsert({
                where: {
                    supplierId_code: {
                        supplierId: finalSupplierId!,
                        code: String(p.code).trim()
                    }
                },
                update: {
                    name: String(p.name).trim(),
                    category: p.category ? String(p.category).trim() : null,
                    price: Number(p.price) || 0,
                    updatedAt: new Date()
                },
                create: {
                    code: String(p.code).trim(),
                    parentCode: p.parentCode ? String(p.parentCode).trim() : null,
                    name: String(p.name).trim(),
                    category: p.category ? String(p.category).trim() : null,
                    price: Number(p.price) || 0,
                    priceType: p.priceType ? String(p.priceType).trim() : null,
                    supplierId: finalSupplierId!
                }
            })
        ))

        // Revalidate if it's potentially the last chunk (client usually knows but we do it anyway)
        // or just rely on the final client-side call if needed.
        // For simplicity, revalidate on every chunk for now (small impact)
        revalidatePath('/suppliers')
        if (finalSupplierId) {
            revalidatePath(`/suppliers/${finalSupplierId}`)
        }

        return NextResponse.json({
            success: true,
            message: `Procesados ${products.length} productos`,
            count: products.length,
            supplierId: finalSupplierId
        })

    } catch (error: any) {
        console.error('Import Batch Error:', error)
        return NextResponse.json({ success: false, message: 'Error al procesar bloque: ' + error.message }, { status: 500 })
    }
}
