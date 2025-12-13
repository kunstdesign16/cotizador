import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return new NextResponse('No file uploaded', { status: 400 })
        }

        const text = await file.text()
        const backup = JSON.parse(text)

        if (!backup.data || !backup.data.clients || !backup.data.quotes) {
            return new NextResponse('Invalid backup format', { status: 400 })
        }

        // Transactional Restore
        // Strategy: Delete all existing data and create new from backup
        // This is a "Full Restore" action.

        await prisma.$transaction(async (tx) => {
            // 1. Delete all data (Order matters due to FKs)
            // Cascade delete handles QuoteItems if Quotes are deleted, 
            // and Quotes if Clients are deleted (now that we added Cascade).
            // But to be safe and explicit or if we want to support partials, we can delete explicitly.

            // Delete QuoteItems first
            await tx.quoteItem.deleteMany()
            // Delete Quotes
            await tx.quote.deleteMany()
            // Delete Clients
            await tx.client.deleteMany()

            // 2. Restore Clients
            if (backup.data.clients.length > 0) {
                await tx.client.createMany({
                    data: backup.data.clients.map((c: any) => ({
                        ...c,
                        createdAt: new Date(c.createdAt),
                        updatedAt: new Date(c.updatedAt)
                    }))
                })
            }

            // 3. Restore Quotes
            if (backup.data.quotes.length > 0) {
                await tx.quote.createMany({
                    data: backup.data.quotes.map((q: any) => ({
                        ...q,
                        date: new Date(q.date),
                        createdAt: new Date(q.createdAt),
                        updatedAt: new Date(q.updatedAt)
                    }))
                })
            }

            // 4. Restore QuoteItems
            if (backup.data.quoteItems && backup.data.quoteItems.length > 0) {
                await tx.quoteItem.createMany({
                    data: backup.data.quoteItems
                })
            }
        })

        revalidatePath('/')
        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error restoring backup:', error)
        return new NextResponse('Error restoring backup', { status: 500 })
    }
}
