import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const { prisma } = await import('@/lib/prisma')
    try {
        const clients = await prisma.client.findMany({
            orderBy: { name: 'asc' }
        })

        // CSV Header
        const header = ['ID', 'Nombre', 'Empresa', 'Email', 'Teléfono', 'Creado']

        // CSV Rows
        const rows = clients.map(client => [
            client.id,
            `"${client.name.replace(/"/g, '""')}"`, // Escape quotes
            `"${(client.company || '').replace(/"/g, '""')}"`,
            `"${(client.email || '').replace(/"/g, '""')}"`,
            `"${(client.phone || '').replace(/"/g, '""')}"`,
            client.createdAt.toISOString()
        ])

        const csvContent = [
            header.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        // Add BOM for Excel utf-8 compatibility
        const bom = '\uFEFF'

        return new NextResponse(bom + csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="clientes_backup_${new Date().toISOString().split('T')[0]}.csv"`
            }
        })
    } catch (error) {
        console.error('Error exporting clients:', error)
        return new NextResponse('Error exporting clients', { status: 500 })
    }
}
