import ExcelJS from 'exceljs'
import path from 'path'

async function inspectMore(filePath: string) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    const sheet = workbook.worksheets[0]
    console.log(`--- More rows for ${path.basename(filePath)} ---`)
    for (let i = 1; i <= 10; i++) {
        const row = sheet.getRow(i)
        const values: any[] = []
        row.eachCell({ includeEmpty: true }, (cell) => {
            values.push(cell.value)
        })
        console.log(`Row ${i}: ${values.join(' | ')}`)
    }
}

inspectMore('/Users/kunstdesign/Documents/Kunst Design/Sitios/cotizador_kunst/Proyectos.xlsx')
