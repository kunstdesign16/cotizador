
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'
import { revalidatePath } from 'next/cache'

// Prevent static generation + long timeout
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Enable long-running if on Vercel Pro, otherwise limits apply

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const supplierId = formData.get('supplierId') as string | null
        const supplierName = formData.get('supplierName') as string | null

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
        }

        // 1. Get or Create Supplier
        let supplier

        if (supplierId) {
            // Use existing supplier by ID
            supplier = await prisma.supplier.findUnique({
                where: { id: supplierId }
            })
            if (!supplier) {
                return NextResponse.json({ success: false, message: 'Proveedor no encontrado' }, { status: 404 })
            }
        } else {
            // Find or create by name
            const name = supplierName || 'Proveedor General'
            supplier = await prisma.supplier.findFirst({
                where: { name }
            })

            if (!supplier) {
                supplier = await prisma.supplier.create({
                    data: { name }
                })
            }
        }

        // 2. Parse Excel
        const arrayBuffer = await file.arrayBuffer()
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(arrayBuffer)

        const sheet = workbook.worksheets[0]
        if (!sheet) {
            return NextResponse.json({ success: false, message: 'No worksheet found' }, { status: 400 })
        }

        const productsToUpsert: Array<{
            code: string
            parentCode: string | null
            name: string
            category: string | null
            price: number
            priceType: string | null
            supplierId: string
        }> = []

        // Auto-detect format by checking header row
        let format: 'LP_MEXICO' | 'PROMO_OPCION' = 'LP_MEXICO'
        const headerRow = sheet.getRow(1)
        const col1Header = headerRow.getCell(1).value?.toString().toUpperCase() || ''
        const col2Header = headerRow.getCell(2).value?.toString().toUpperCase() || ''
        const col3Header = headerRow.getCell(3).value?.toString().toUpperCase() || ''

        // Format detection: Check if it's the simple 3-column format
        // Col1=CÓDIGO, Col2=NOMBRE, Col3=PRECIO
        if (col1Header.includes('CÓDIGO') && col2Header.includes('NOMBRE') && col3Header.includes('PRECIO')) {
            format = 'PROMO_OPCION'
        }
        // Also check if col2=NOMBRE and col3=PRECIO (código might be in col1 without header)
        else if (col2Header.includes('NOMBRE') && col3Header.includes('PRECIO')) {
            format = 'PROMO_OPCION'
        }

        const START_ROW = format === 'PROMO_OPCION' ? 2 : 8

        sheet.eachRow((row, rowNumber) => {
            if (rowNumber < START_ROW) return

            let code: string, parentCode: string | null, name: string, category: string | null, priceType: string | null, price: number

            if (format === 'PROMO_OPCION') {
                // Format: Col1=Code, Col2=Name, Col3=Price
                const codeVal = row.getCell(1).value
                const nameVal = row.getCell(2).value
                const priceVal = row.getCell(3).value

                if (!codeVal || !nameVal) return

                code = String(codeVal).trim()
                parentCode = null
                name = String(nameVal).trim()
                category = null
                priceType = null

                // Parse price (format: "$ 171.00")
                if (typeof priceVal === 'string') {
                    price = parseFloat(priceVal.replace(/[$,\s]/g, '')) || 0
                } else if (typeof priceVal === 'number') {
                    price = priceVal
                } else {
                    price = 0
                }
            } else {
                // LP_MEXICO Format: Cols 3-8
                const codeVal = row.getCell(3).value
                const parentCodeVal = row.getCell(4).value
                const nameVal = row.getCell(5).value
                const categoryVal = row.getCell(6).value
                const priceVal = row.getCell(7).value
                const priceTypeVal = row.getCell(8).value

                if (!codeVal || !nameVal) return

                code = String(codeVal).trim()
                parentCode = parentCodeVal ? String(parentCodeVal).trim() : null
                name = String(nameVal).trim()
                category = categoryVal ? String(categoryVal).trim() : null
                priceType = priceTypeVal ? String(priceTypeVal).trim() : null

                if (typeof priceVal === 'number') {
                    price = priceVal
                } else if (typeof priceVal === 'string') {
                    price = parseFloat(priceVal.replace(/[^0-9.]/g, '')) || 0
                } else {
                    price = 0
                }
            }

            productsToUpsert.push({
                code,
                parentCode,
                name,
                category,
                price,
                priceType,
                supplierId: supplier.id
            })
        })

        console.log(`Processing ${productsToUpsert.length} products...`)

        // 3. Sequential Upsert in larger chunks
        const CHUNK_SIZE = 100
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
            console.log(`Import progress: ${Math.min(i + CHUNK_SIZE, productsToUpsert.length)}/${productsToUpsert.length}`)
        }

        if (supplierId) {
            revalidatePath(`/suppliers/${supplierId}`)
        }
        revalidatePath('/suppliers')

        return NextResponse.json({
            success: true,
            message: `Procesados ${productsToUpsert.length} productos del proveedor ${supplierName || supplier.name}`,
            count: productsToUpsert.length
        })

    } catch (error) {
        console.error('Import Error:', error)
        return NextResponse.json({ success: false, message: 'Error interno al procesar el archivo' }, { status: 500 })
    }
}
