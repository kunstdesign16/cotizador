import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            include: {
                _count: {
                    select: { quotes: true }
                }
            },
            orderBy: { name: 'asc' }
        })

        const pegaduro = clients.find(c => c.name.toLowerCase().includes('pegaduro') || (c.company && c.company.toLowerCase().includes('pegaduro')))

        return NextResponse.json({
            count: clients.length,
            pegaduro: pegaduro || 'Not Found',
            all: clients.map(c => ({
                id: c.id,
                name: c.name,
                company: c.company,
                quotesCount: c._count.quotes
            }))
        })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
