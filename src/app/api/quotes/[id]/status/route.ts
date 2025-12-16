import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { status } = await request.json()
        const { id } = params

        const updatedQuote = await prisma.quote.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json({ success: true, quote: updatedQuote })
    } catch (error) {
        console.error('Error updating quote status:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update status' },
            { status: 500 }
        )
    }
}
