import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const [clients, quotes, quoteItems] = await Promise.all([
            prisma.client.findMany(),
            prisma.quote.findMany(),
            prisma.quoteItem.findMany()
        ])

        const backupData = {
            version: 1,
            timestamp: new Date().toISOString(),
            data: {
                clients,
                quotes,
                quoteItems
            }
        }

        return new NextResponse(JSON.stringify(backupData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="full_backup_${new Date().toISOString().split('T')[0]}.json"`
            }
        })
    } catch (error) {
        console.error('Error generating backup:', error)
        return new NextResponse('Error generating backup', { status: 500 })
    }
}
