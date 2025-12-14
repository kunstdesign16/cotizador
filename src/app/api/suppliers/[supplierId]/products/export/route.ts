import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function GET(
    request: NextRequest,
    { params }: { params: { supplierId: string } }
) {
    try {
        const { prisma } = await import('@/lib/prisma')
        const { supplierId } = params

        // Fetch supplier and products
        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
            include: {
                products: {
                    orderBy: { code: 'asc' }
                }
            }
        })

        if (!supplier) {
            return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
        }

        // Create workbook
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Productos')

        // Add headers
        worksheet.columns = [
            { header: 'Código', key: 'code', width: 15 },
            { header: 'Código Padre', key: 'parentCode', width: 15 },
            { header: 'Nombre', key: 'name', width: 40 },
            { header: 'Categoría', key: 'category', width: 20 },
            { header: 'Precio', key: 'price', width: 12 },
            { header: 'Tipo de Precio', key: 'priceType', width: 15 }
        ]

        // Style header row
        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        }

        // Add data
        supplier.products.forEach(product => {
            worksheet.addRow({
                code: product.code,
                parentCode: product.parentCode || '',
                name: product.name,
                category: product.category || '',
                price: product.price,
                priceType: product.priceType || ''
            })
        })

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer()

        // Return file
        const filename = `${supplier.name.replace(/[^a-z0-9]/gi, '_')}_productos_${new Date().toISOString().split('T')[0]}.xlsx`

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        })
    } catch (error) {
        console.error('Error exporting products:', error)
        return NextResponse.json({ error: 'Error al exportar productos' }, { status: 500 })
    }
}
