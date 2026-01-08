import ExcelJS from 'exceljs'

async function checkSheets(filePath: string) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    console.log(`Sheets in ${filePath}:`)
    workbook.worksheets.forEach(sheet => {
        console.log(`- ${sheet.name}`)
    })
}

checkSheets('/Users/kunstdesign/Documents/Kunst Design/Sitios/cotizador_kunst/Proyectos.xlsx')
