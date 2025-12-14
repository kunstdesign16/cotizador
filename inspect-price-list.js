
const ExcelJS = require('exceljs');
const path = require('path');

// Use the absolute path provided by the user/context
const filePath = '/Users/kunstdesign/Documents/cotizador_kunst/LP-MX-GRAL- MXN_12_AGO_2025.xlsx';

async function readExcel() {
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
        console.log("Workbook loaded.");

        workbook.eachSheet((worksheet, sheetId) => {
            console.log(`\n--- Sheet: ${worksheet.name} ---`);
            // Print first 5 rows to understand structure
            let count = 0;
            worksheet.eachRow((row, rowNumber) => {
                if (count < 5) {
                    // Filter out null values for cleaner output
                    const values = row.values;
                    const cleanValues = Array.isArray(values) ? values.map(v => v === null ? '' : v) : values;
                    console.log(`Row ${rowNumber}:`, JSON.stringify(cleanValues));
                    count++;
                }
            });
        });

    } catch (error) {
        console.error("Error reading file:", error);
    }
}

readExcel();
