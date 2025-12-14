
import { PrismaClient } from '@prisma/client'
import ExcelJS from 'exceljs'
import path from 'path'

const prisma = new PrismaClient()

// File path provided by user
const FILE_PATH = '/Users/kunstdesign/Documents/cotizador_kunst/LP-MX-GRAL- MXN_12_AGO_2025.xlsx'
const SHEET_NAME = 'LP MEXICO'
const START_ROW = 8
const SUPPLIER_NAME = 'LP Mexico'

async function main() {
    console.log(`Starting import for ${SUPPLIER_NAME}...`)

    // 1. Create or Get Supplier
    const supplier = await prisma.supplier.upsert({
        where: { id: 'lp-mexico-default' }, // predictable ID or find by name if we add @unique to name
        update: {},
        create: {
            id: 'lp-mexico-default',
            name: SUPPLIER_NAME
        }
    })
    console.log(`Using Supplier: ${supplier.name} (${supplier.id})`)

    // 2. Read Excel
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(FILE_PATH)
    const sheet = workbook.getWorksheet(SHEET_NAME)

    if (!sheet) {
        console.error(`Sheet "${SHEET_NAME}" not found.`)
        process.exit(1)
    }

    console.log(`Reading rows from ${SHEET_NAME}...`)

    let count = 0
    const productsToUpsert = []

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber < START_ROW) return

        // Columns: 3(Code), 5(Name), 6(Category), 7(Price)
        const codeVal = row.getCell(3).value
        const nameVal = row.getCell(5).value
        const categoryVal = row.getCell(6).value
        const priceVal = row.getCell(7).value

        // Validate
        if (!codeVal || !nameVal) return

        const code = String(codeVal).trim()
        const name = String(nameVal).trim()
        const category = categoryVal ? String(categoryVal).trim() : null

        // Price might be string or number. Clean it.
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
            supplierId: supplier.id
        })
    })

    console.log(`Found ${productsToUpsert.length} products. Starting Upsert (this may take a moment)...`)

    // Batch upsert? Prisma doesn't have createMany with overwrite for everything easily, 
    // but transaction is good.
    // For large datasets, sequential or chunked promises is better.

    // Using transaction for atomic success, but might be too big. 
    // Let's do chunks of 50.

    const BATCH_SIZE = 50
    for (let i = 0; i < productsToUpsert.length; i += BATCH_SIZE) {
        const batch = productsToUpsert.slice(i, i + BATCH_SIZE)

        // Parallel upserts
        await Promise.all(batch.map(p =>
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
                    price: p.price
                },
                create: p
            })
        ))
        process.stdout.write('.')
    }

    console.log(`\nImport completed successfully.`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
