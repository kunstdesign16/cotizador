import { PrismaClient } from '@prisma/client'
import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.POSTGRES_URL_NON_POOLING
        }
    }
})

const BASE_PATH = '/Users/kunstdesign/Documents/Kunst Design/Sitios/cotizador_kunst'

const catalogs = [
    { file: 'LP-MX-GRAL- MXN_12_AGO_2025.xlsx', supplierName: 'LP México' },
    { file: 'Lista de precios Promo Opcion.xlsx', supplierName: 'Promo Opción' },
    { file: 'Lista de Precios Limón_Limón.xlsx', supplierName: 'Limón Limón' },
    { file: 'Lista de Precios Nitida.xlsx', supplierName: 'Nitida' },
    { file: 'Lista de Precios Scrittura.xlsx', supplierName: 'Scrittura' },
    { file: 'Lista de Precios Ulises.xlsx', supplierName: 'Ulises' },
    { file: 'Lista de Precios Yazbek.xlsx', supplierName: 'Yazbek' }
]

async function importCatalog(fileName: string, supplierName: string) {
    console.log(`\n>>> Importing ${fileName} for supplier ${supplierName}...`)
    const filePath = path.join(BASE_PATH, fileName)

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`)
        return
    }

    // 1. Get or Create Supplier
    let supplier = await prisma.supplier.findFirst({
        where: { name: supplierName }
    })

    if (!supplier) {
        supplier = await prisma.supplier.create({
            data: { name: supplierName }
        })
        console.log(`Created supplier: ${supplierName}`)
    }

    // 2. Parse Excel
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    const sheet = workbook.worksheets[0]

    const productsToUpsert: any[] = []

    // Format detection
    let format: 'LP_MEXICO' | 'PROMO_OPCION' = 'LP_MEXICO'
    const headerRow = sheet.getRow(1)
    const col1Header = headerRow.getCell(1).value?.toString().toUpperCase() || ''
    const col2Header = headerRow.getCell(2).value?.toString().toUpperCase() || ''
    const col3Header = headerRow.getCell(3).value?.toString().toUpperCase() || ''

    if (col1Header.includes('CÓDIGO') || col2Header.includes('NOMBRE') || col3Header.includes('PRECIO')) {
        format = 'PROMO_OPCION'
    }

    const START_ROW = format === 'PROMO_OPCION' ? 2 : 8
    console.log(`Detected format: ${format}, starting from row ${START_ROW}`)

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber < START_ROW) return

        let code: string, parentCode: string | null = null, name: string, category: string | null = null, priceType: string | null = null, price: number = 0

        if (format === 'PROMO_OPCION') {
            const codeVal = row.getCell(1).value
            const nameVal = row.getCell(2).value
            const priceVal = row.getCell(3).value
            const catVal = row.getCell(4).value

            if (!codeVal || !nameVal) return

            code = String(codeVal).trim()
            name = String(nameVal).trim()
            category = catVal ? String(catVal).trim() : null

            if (typeof priceVal === 'string') {
                price = parseFloat(priceVal.replace(/[$,\s]/g, '')) || 0
            } else if (typeof priceVal === 'number') {
                price = priceVal
            }
        } else {
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
            }
        }

        productsToUpsert.push({
            code,
            parentCode,
            name,
            category,
            price,
            priceType,
            supplierId: supplier!.id
        })
    })

    console.log(`Parsed ${productsToUpsert.length} products. Upserting to database...`)

    console.log(`Parsed ${productsToUpsert.length} products. Upserting to database...`)
    console.log(`Using URL: ${process.env.POSTGRES_URL_NON_POOLING?.substring(0, 30)}...`)

    for (let i = 0; i < productsToUpsert.length; i++) {
        const p = productsToUpsert[i]
        await prisma.product.upsert({
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
        if (i % 500 === 0) console.log(`  Processed ${i} / ${productsToUpsert.length}...`)
    }
    console.log(`Finished ${supplierName}.`)
}

async function run() {
    try {
        for (const catalog of catalogs) {
            await importCatalog(catalog.file, catalog.supplierName)
        }
    } catch (error) {
        console.error('Run Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

run()
