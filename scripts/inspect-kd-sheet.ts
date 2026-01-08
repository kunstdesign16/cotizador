import ExcelJS from 'exceljs'

async function inspectSheet(filePath: string, sheetName: string) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    const sheet = workbook.getWorksheet(sheetName)
    if (!sheet) {
        console.log(`Sheet ${sheetName} not found.`)
        return
    }
    console.log(`--- Rows for ${sheetName} ---`)
    for (let i = 1; i <= 5; i++) {
        const row = sheet.getRow(i)
        const values: any[] = []
        row.eachCell({ includeEmpty: true }, (cell) => {
            values.push(cell.value)
        })
        console.log(`Row ${i}: ${values.join(' | ')}`)
    }
}

inspectSheet('/Users/kunstdesign/Documents/Kunst Design/Sitios/cotizador_kunst/Proyectos.xlsx', 'Precio KD')
