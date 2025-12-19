import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { getAccountingSummary } from '@/actions/accounting'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

        const summary = await getAccountingSummary(month)

        const workbook = new ExcelJS.Workbook()

        // --- SUMMARY SHEET ---
        const summarySheet = workbook.addWorksheet('Resumen')
        summarySheet.columns = [
            { header: 'Concepto', key: 'concept', width: 30 },
            { header: 'Monto', key: 'amount', width: 15 }
        ]

        const totalInc = summary.incomes.reduce((s, i) => s + i.amount, 0)
        const totalIVAInc = summary.incomes.reduce((s, i) => s + (i.iva || 0), 0)
        const totalVar = summary.variableExpenses.reduce((s, e) => s + e.amount, 0)
        const totalIVAVar = summary.variableExpenses.reduce((s, e) => s + (e.iva || 0), 0)
        const totalFix = summary.fixedExpenses.reduce((s, e) => s + e.amount, 0)

        summarySheet.addRows([
            { concept: 'Ingresos Totales (Subtotal)', amount: totalInc },
            { concept: 'IVA Cobrado', amount: totalIVAInc },
            { concept: 'Total Cobrado (IVA Incl.)', amount: totalInc + totalIVAInc },
            { concept: '', amount: '' },
            { concept: 'Gastos Variables (Subtotal)', amount: totalVar },
            { concept: 'IVA Pagado (Variables)', amount: totalIVAVar },
            { concept: 'Gastos Fijos', amount: totalFix },
            { concept: 'Total Egresos', amount: totalVar + totalIVAVar + totalFix },
            { concept: '', amount: '' },
            { concept: 'Utilidad Neta', amount: totalInc - (totalVar + totalFix) }
        ])
        summarySheet.getRow(1).font = { bold: true }

        // --- INCOMES SHEET ---
        const incomeSheet = workbook.addWorksheet('Ingresos')
        incomeSheet.columns = [
            { header: 'Fecha', key: 'date', width: 15 },
            { header: 'Descripción', key: 'desc', width: 40 },
            { header: 'Cliente/Proyecto', key: 'client', width: 30 },
            { header: 'Monto', key: 'amount', width: 12 },
            { header: 'IVA', key: 'iva', width: 12 },
            { header: 'Total', key: 'total', width: 12 }
        ]
        summary.incomes.forEach(i => {
            incomeSheet.addRow({
                date: i.date.toISOString().split('T')[0],
                desc: i.description,
                client: i.client?.name || i.quote?.project_name || '-',
                amount: i.amount,
                iva: i.iva || 0,
                total: i.amount + (i.iva || 0)
            })
        })
        incomeSheet.getRow(1).font = { bold: true }

        // --- EXPENSES SHEET ---
        const expenseSheet = workbook.addWorksheet('Egresos')
        expenseSheet.columns = [
            { header: 'Fecha', key: 'date', width: 15 },
            { header: 'Descripción', key: 'desc', width: 40 },
            { header: 'Categoría', key: 'cat', width: 15 },
            { header: 'Monto', key: 'amount', width: 12 },
            { header: 'IVA', key: 'iva', width: 12 },
            { header: 'Total', key: 'total', width: 12 }
        ]
        // Variables
        summary.variableExpenses.forEach(e => {
            expenseSheet.addRow({
                date: e.date.toISOString().split('T')[0],
                desc: e.description,
                cat: e.category || 'Variable',
                amount: e.amount,
                iva: e.iva || 0,
                total: e.amount + (e.iva || 0)
            })
        })
        // Fixed
        summary.fixedExpenses.forEach(e => {
            expenseSheet.addRow({
                date: e.date.toISOString().split('T')[0],
                desc: e.description,
                cat: e.category || 'Fijo',
                amount: e.amount,
                iva: 0,
                total: e.amount
            })
        })
        expenseSheet.getRow(1).font = { bold: true }

        const buffer = await workbook.xlsx.writeBuffer()
        const filename = `Contabilidad_${month}.xlsx`

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        })
    } catch (error) {
        console.error('Error exporting accounting:', error)
        return NextResponse.json({ error: 'Error al exportar' }, { status: 500 })
    }
}
