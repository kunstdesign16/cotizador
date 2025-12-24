import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// Format currency for display
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount)
}

// Format date for display
function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(d)
}

// Generate Project PDF Report
export function generateProjectPDF(reportData: any) {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text('KUNST & DESIGN', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Desarrollando ideas, creando sueños', pageWidth / 2, 27, { align: 'center' })

    // Title
    doc.setFontSize(16)
    doc.setTextColor(0, 102, 204) // Primary blue
    doc.text('REPORTE DE PROYECTO', pageWidth / 2, 40, { align: 'center' })

    // Project Info
    let yPos = 55
    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.text(`Proyecto: ${reportData.project.name}`, 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text(`Cliente: ${reportData.client.name}`, 20, yPos)
    if (reportData.client.company) {
        yPos += 5
        doc.text(`Empresa: ${reportData.client.company}`, 20, yPos)
    }
    yPos += 5
    doc.text(`Estado: ${reportData.project.status}`, 20, yPos)
    yPos += 5
    doc.text(`Fecha de Creación: ${formatDate(reportData.project.createdAt)}`, 20, yPos)

    // Financial Summary
    yPos += 15
    doc.setFontSize(12)
    doc.setTextColor(0, 102, 204)
    doc.text('RESUMEN FINANCIERO', 20, yPos)

    yPos += 10
    autoTable(doc, {
        startY: yPos,
        head: [['Concepto', 'Monto']],
        body: [
            ['Total Ingresos', formatCurrency(reportData.financial.totalIngresos)],
            ['Total Egresos', formatCurrency(reportData.financial.totalEgresos)],
            ['Utilidad', formatCurrency(reportData.financial.utilidad)],
            ['Margen de Utilidad', `${reportData.financial.margenUtilidad}%`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204] },
        margin: { left: 20, right: 20 }
    })

    // Quotes Summary
    yPos = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(12)
    doc.setTextColor(0, 102, 204)
    doc.text('COTIZACIONES', 20, yPos)

    yPos += 10
    autoTable(doc, {
        startY: yPos,
        head: [['Estado', 'Cantidad']],
        body: [
            ['Total', reportData.quotes.total.toString()],
            ['Borradores', reportData.quotes.draft.toString()],
            ['Enviadas', reportData.quotes.sent.toString()],
            ['Aprobadas', reportData.quotes.approved.toString()],
            ['Facturadas', reportData.quotes.facturado.toString()],
            ['Cobradas', reportData.quotes.cobrado.toString()],
            ['Total Cotizado', formatCurrency(reportData.quotes.totalCotizado)]
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204] },
        margin: { left: 20, right: 20 }
    })

    // Orders Summary
    if (reportData.orders.total > 0) {
        yPos = (doc as any).lastAutoTable.finalY + 15

        // Check if we need a new page
        if (yPos > 250) {
            doc.addPage()
            yPos = 20
        }

        doc.setFontSize(12)
        doc.setTextColor(0, 102, 204)
        doc.text('ÓRDENES DE COMPRA', 20, yPos)

        yPos += 10
        autoTable(doc, {
            startY: yPos,
            head: [['Estado', 'Cantidad']],
            body: [
                ['Total', reportData.orders.total.toString()],
                ['Pendientes', reportData.orders.pending.toString()],
                ['Ordenadas', reportData.orders.ordered.toString()],
                ['Recibidas', reportData.orders.received.toString()]
            ],
            theme: 'striped',
            headStyles: { fillColor: [0, 102, 204] },
            margin: { left: 20, right: 20 }
        })
    }

    // Tasks Summary
    if (reportData.tasks.total > 0) {
        yPos = (doc as any).lastAutoTable.finalY + 15

        // Check if we need a new page
        if (yPos > 250) {
            doc.addPage()
            yPos = 20
        }

        doc.setFontSize(12)
        doc.setTextColor(0, 102, 204)
        doc.text('TAREAS', 20, yPos)

        yPos += 10
        autoTable(doc, {
            startY: yPos,
            head: [['Estado', 'Cantidad']],
            body: [
                ['Total', reportData.tasks.total.toString()],
                ['Pendientes', reportData.tasks.pending.toString()],
                ['En Progreso', reportData.tasks.inProgress.toString()],
                ['Completadas', reportData.tasks.completed.toString()]
            ],
            theme: 'striped',
            headStyles: { fillColor: [0, 102, 204] },
            margin: { left: 20, right: 20 }
        })
    }

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
            `Kunst & Design - Reporte generado el ${formatDate(new Date())}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        )
        doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth - 20,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'right' }
        )
    }

    // Download
    doc.save(`Reporte_Proyecto_${reportData.project.name.replace(/\s+/g, '_')}.pdf`)
}

// Generate Financial Kardex Excel
export function generateFinancialExcel(kardexData: any) {
    const workbook = XLSX.utils.book_new()

    // Prepare data
    const data = [
        ['KUNST & DESIGN'],
        ['Kárdex Financiero'],
        [`Periodo: ${formatDate(kardexData.startDate)} - ${formatDate(kardexData.endDate)}`],
        [`Tipo de Flujo: ${kardexData.flowType === 'all' ? 'Todo' : kardexData.flowType === 'ingresos' ? 'Solo Ingresos' : 'Solo Egresos'}`],
        [],
        ['Fecha', 'Proyecto', 'Concepto', 'Cliente/Proveedor', 'Ingreso', 'Egreso', 'Saldo']
    ]

    kardexData.transactions.forEach((t: any) => {
        data.push([
            formatDate(t.date),
            t.proyecto,
            t.concepto,
            t.cliente,
            t.ingreso > 0 ? t.ingreso : '',
            t.egreso > 0 ? t.egreso : '',
            t.saldo
        ])
    })

    // Add totals
    data.push([])
    data.push([
        '', '', '', 'TOTALES:',
        kardexData.totals.totalIngresos,
        kardexData.totals.totalEgresos,
        kardexData.totals.saldoFinal
    ])

    const worksheet = XLSX.utils.aoa_to_sheet(data)

    // Set column widths
    worksheet['!cols'] = [
        { wch: 12 }, // Fecha
        { wch: 20 }, // Proyecto
        { wch: 30 }, // Concepto
        { wch: 20 }, // Cliente
        { wch: 12 }, // Ingreso
        { wch: 12 }, // Egreso
        { wch: 12 }  // Saldo
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kárdex')

    // Download
    XLSX.writeFile(workbook, `Kardex_Financiero_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Generate Financial Kardex CSV
export function generateFinancialCSV(kardexData: any) {
    const headers = ['Fecha', 'Proyecto', 'Concepto', 'Cliente/Proveedor', 'Ingreso', 'Egreso', 'Saldo']

    const rows = kardexData.transactions.map((t: any) => [
        formatDate(t.date),
        t.proyecto,
        t.concepto,
        t.cliente,
        t.ingreso > 0 ? t.ingreso : '',
        t.egreso > 0 ? t.egreso : '',
        t.saldo
    ])

    // Add totals
    rows.push([])
    rows.push([
        '', '', '', 'TOTALES:',
        kardexData.totals.totalIngresos,
        kardexData.totals.totalEgresos,
        kardexData.totals.saldoFinal
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Kardex_Financiero_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
}

// Generate Client PDF Report
export function generateClientPDF(reportData: any) {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text('KUNST & DESIGN', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Desarrollando ideas, creando sueños', pageWidth / 2, 27, { align: 'center' })

    // Title
    doc.setFontSize(16)
    doc.setTextColor(0, 102, 204)
    doc.text('HOJA DE VIDA COMERCIAL', pageWidth / 2, 40, { align: 'center' })

    // Client Info
    let yPos = 55
    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.text(`Cliente: ${reportData.client.name}`, 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    if (reportData.client.company) {
        doc.text(`Empresa: ${reportData.client.company}`, 20, yPos)
        yPos += 5
    }
    if (reportData.client.email) {
        doc.text(`Email: ${reportData.client.email}`, 20, yPos)
        yPos += 5
    }
    if (reportData.client.phone) {
        doc.text(`Teléfono: ${reportData.client.phone}`, 20, yPos)
        yPos += 5
    }
    doc.text(`Cliente desde: ${formatDate(reportData.client.createdAt)}`, 20, yPos)

    // Metrics Summary
    yPos += 15
    doc.setFontSize(12)
    doc.setTextColor(0, 102, 204)
    doc.text('RESUMEN COMERCIAL', 20, yPos)

    yPos += 10
    autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: [
            ['Total de Proyectos', reportData.metrics.totalProyectos.toString()],
            ['Total de Cotizaciones', reportData.metrics.totalCotizaciones.toString()],
            ['Ingresos Generados', formatCurrency(reportData.metrics.totalIngresos)],
            ['Egresos Asociados', formatCurrency(reportData.metrics.totalEgresos)],
            ['Utilidad Total', formatCurrency(reportData.metrics.utilidadTotal)],
            ['Margen Promedio', `${reportData.metrics.margenPromedio}%`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204] },
        margin: { left: 20, right: 20 }
    })

    // Quotes by Status
    yPos = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(12)
    doc.setTextColor(0, 102, 204)
    doc.text('COTIZACIONES POR ESTADO', 20, yPos)

    yPos += 10
    autoTable(doc, {
        startY: yPos,
        head: [['Estado', 'Cantidad']],
        body: [
            ['Borradores', reportData.quotesByStatus.draft.toString()],
            ['Enviadas', reportData.quotesByStatus.sent.toString()],
            ['Aprobadas', reportData.quotesByStatus.approved.toString()],
            ['Facturadas', reportData.quotesByStatus.facturado.toString()],
            ['Cobradas', reportData.quotesByStatus.cobrado.toString()]
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204] },
        margin: { left: 20, right: 20 }
    })

    // Projects by Status
    yPos = (doc as any).lastAutoTable.finalY + 15

    // Check if we need a new page
    if (yPos > 250) {
        doc.addPage()
        yPos = 20
    }

    doc.setFontSize(12)
    doc.setTextColor(0, 102, 204)
    doc.text('PROYECTOS POR ESTADO', 20, yPos)

    yPos += 10
    autoTable(doc, {
        startY: yPos,
        head: [['Estado', 'Cantidad']],
        body: [
            ['Cotizando', reportData.projectsByStatus.cotizando.toString()],
            ['Aprobado', reportData.projectsByStatus.aprobado.toString()],
            ['En Producción', reportData.projectsByStatus.produccion.toString()],
            ['Entregado', reportData.projectsByStatus.entregado.toString()],
            ['Cerrado', reportData.projectsByStatus.cerrado.toString()]
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204] },
        margin: { left: 20, right: 20 }
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
            `Kunst & Design - Reporte generado el ${formatDate(new Date())}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        )
        doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth - 20,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'right' }
        )
    }

    // Download
    doc.save(`Hoja_Vida_${reportData.client.name.replace(/\s+/g, '_')}.pdf`)
}

// Generate Supplier Excel Report
export function generateSupplierExcel(reportData: any) {
    const workbook = XLSX.utils.book_new()

    // Summary Sheet
    const summaryData = [
        ['KUNST & DESIGN'],
        ['Estado de Cuenta de Proveedor'],
        [`Proveedor: ${reportData.supplier.name}`],
        [`Tipo: ${reportData.supplier.type}`],
        [],
        ['RESUMEN'],
        ['Total de Órdenes', reportData.metrics.totalOrdenes],
        ['Total de Tareas', reportData.metrics.totalTareas],
        ['Total Pagado', reportData.metrics.totalPagos],
        [],
        ['ÓRDENES POR ESTADO'],
        ['Pendientes', reportData.ordersByStatus.pending],
        ['Ordenadas', reportData.ordersByStatus.ordered],
        ['Recibidas', reportData.ordersByStatus.received],
        [],
        ['ESTADO DE PAGO'],
        ['Pendiente', reportData.paymentStatus.pending],
        ['Parcial', reportData.paymentStatus.partial],
        ['Pagado', reportData.paymentStatus.paid]
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')

    // Expenses Sheet
    if (reportData.expenses.length > 0) {
        const expensesData = [
            ['Fecha', 'Descripción', 'Proyecto', 'Monto', 'IVA', 'Total']
        ]

        reportData.expenses.forEach((expense: any) => {
            expensesData.push([
                formatDate(expense.date),
                expense.description,
                expense.project?.name || '-',
                expense.amount,
                expense.iva,
                expense.amount + expense.iva
            ])
        })

        const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData)
        expensesSheet['!cols'] = [
            { wch: 12 },
            { wch: 30 },
            { wch: 20 },
            { wch: 12 },
            { wch: 10 },
            { wch: 12 }
        ]
        XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Pagos')
    }

    // Download
    XLSX.writeFile(workbook, `Estado_Cuenta_${reportData.supplier.name.replace(/\s+/g, '_')}.xlsx`)
}
