import ExcelJS from 'exceljs'
import path from 'path'

async function checkHeaders(filePath: string) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    const sheet = workbook.worksheets[0]
    console.log(`--- Headers for ${path.basename(filePath)} ---`)
    const row = sheet.getRow(1)
    const headers: string[] = []
    row.eachCell((cell) => headers.push(String(cell.value)))
    console.log(headers.join(' | '))
}

const files = [
    'Lista de Precios Limón_Limón.xlsx',
    'Lista de Precios Nitida.xlsx',
    'Lista de Precios Scrittura.xlsx',
    'Lista de Precios Ulises.xlsx',
    'Lista de Precios Yazbek.xlsx'
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
