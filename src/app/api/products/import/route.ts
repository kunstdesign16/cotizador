
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

// Prevent static generation + long timeout
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Enable long-running if on Vercel Pro, otherwise limits apply

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const supplierName = formData.get('supplierName') as string || 'Proveedor General'

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
        }

        // 1. Create or Get Supplier
        // Use a slug-like ID generation or just findFirst to keep it simple for now
        let supplier = await prisma.supplier.findFirst({
            where: { name: supplierName }
        })

        if (!supplier) {
            supplier = await prisma.supplier.create({
                data: { name: supplierName }
            })
        }

        // 2. Parse Excel
        const buffer = await file.arrayBuffer()
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(buffer)

        // Assume first sheet or "LP MEXICO"
        let sheet = workbook.getWorksheet('LP MEXICO')
        if (!sheet) sheet = workbook.worksheets[0]

        if (!sheet) {
            return NextResponse.json({ success: false, message: 'No worksheet found' }, { status: 400 })
        }

        const productsToUpsert: Array<{
            code: string
            name: string
            category: string | null
            price: number
            supplierId: string
        }> = []
        const START_ROW = 8 // From inspection

        sheet.eachRow((row, rowNumber) => {
            if (rowNumber < START_ROW) return

            // Columns: 3(Code), 5(Name), 6(Category), 7(Price)
            const codeVal = row.getCell(3).value
            const nameVal = row.getCell(5).value
            const categoryVal = row.getCell(6).value
            const priceVal = row.getCell(7).value

            if (!codeVal || !nameVal) return

            const code = String(codeVal).trim()
            const name = String(nameVal).trim()
            const category = categoryVal ? String(categoryVal).trim() : null

            let price = 0
            if (typeof priceVal === 'number') {
                price = priceVal
            } else if (typeof priceVal === 'string') {
                price = parseFloat(priceVal.replace(/[^0-9.]/g, '')) || 0
            }

            productsToUpsert.push({
                code,
                name,
                category,
                price,
                supplierId: supplier!.id
            })
        })

        console.log(`Processing ${productsToUpsert.length} products...`)

        // 3. Sequential Upsert (Better for safety than giant Promise.all on serverless)
        // Or createMany if we don't care about duplicates? No, we want to update prices.
        // We defined @@unique([supplierId, code]), so we can use upsert.

        let created = 0
        let updated = 0

        // Processing in chunks to avoid blocking too long
        const CHUNK_SIZE = 50
        for (let i = 0; i < productsToUpsert.length; i += CHUNK_SIZE) {
            const chunk = productsToUpsert.slice(i, i + CHUNK_SIZE)
            await Promise.all(chunk.map(p =>
                prisma.product.upsert({
                    where: {
                        supplierId_code: {
                            supplierId: p.supplierId,
                            code: p.code
                        }
                    },
                    update: {
                        name: p.name,
                        category: p.category,
                        price: p.price,
                        updatedAt: new Date()
                    },
                    create: p
                })
            ))
            created += chunk.length // Approximate (upsert result not checked individually for speed)
        }

        return NextResponse.json({
            success: true,
            message: `Procesados ${productsToUpsert.length} productos del proveedor ${supplierName}`,
            count: productsToUpsert.length
        })

    } catch (error) {
        console.error('Import Error:', error)
        return NextResponse.json({ success: false, message: 'Error interno al procesar el archivo' }, { status: 500 })
    }
}
