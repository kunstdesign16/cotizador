import ExcelJS from 'exceljs'
import path from 'path'

async function checkHeaders(filePath: string) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    const sheet = workbook.worksheets[0]
    console.log(`--- Headers for ${path.basename(filePath)} ---`)
    const row = sheet.getRow(1)
    row.eachCell((cell, colNumber) => {
        console.log(`Col ${colNumber}: ${cell.value}`)
    })
    console.log('--- Sample Row 2 ---')
    const row2 = sheet.getRow(2)
    row2.eachCell((cell, colNumber) => {
        console.log(`Col ${colNumber}: ${cell.value}`)
    })
}

const files = [
    'Proyectos.xlsx',
    'Lista de precios Promo Opcion.xlsx',
    'LP-MX-GRAL- MXN_12_AGO_2025.xlsx'
]

async function run() {
    for (const f of files) {
        try {
            await checkHeaders(path.join('/Users/kunstdesign/Documents/Kunst Design/Sitios/cotizador_kunst', f))
        } catch (e) {
            console.error(`Error reading ${f}:`, e)
        }
    }
}

run()
