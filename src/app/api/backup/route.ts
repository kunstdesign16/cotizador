import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const [
            clients,
            projects,
            quotes,
            quoteItems,
            suppliers,
            supplierOrders,
            supplierTasks,
            products,
            fixedExpenses,
            incomes,
            variableExpenses
        ] = await Promise.all([
            prisma.client.findMany(),
            prisma.project.findMany(),
            prisma.quote.findMany(),
            prisma.quoteItem.findMany(),
            prisma.supplier.findMany(),
            prisma.supplierOrder.findMany(),
            prisma.supplierTask.findMany(),
            prisma.product.findMany(),
            prisma.fixedExpense.findMany(),
            prisma.income.findMany(),
            prisma.variableExpense.findMany()
        ])

        const backupData = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            data: {
                clients,
                projects,
                quotes,
                quoteItems,
                suppliers,
                supplierOrders,
                supplierTasks,
                products,
                fixedExpenses,
                incomes,
                variableExpenses
            }
        }

        return new NextResponse(JSON.stringify(backupData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.json"`
            }
        })
    } catch (error) {
        console.error('Backup error:', error)
        return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { data } = body

        if (!data) {
            return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 })
        }

        // Use a transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // Delete existing data in reverse order of dependencies
            // Note: This is a destructive operation. In a real production app, 
            // we'd probably want a more sophisticated merge/upsert logic.
            // But since this is a "Restore" feature requested after data loss, 
            // replacing with backup is often what's intended.

            await tx.variableExpense.deleteMany()
            await tx.income.deleteMany()
            await tx.fixedExpense.deleteMany()
            await tx.quoteItem.deleteMany()
            await tx.supplierOrder.deleteMany()
            await tx.supplierTask.deleteMany()
            await tx.quote.deleteMany()
            await tx.product.deleteMany()
            await tx.project.deleteMany()
            await tx.supplier.deleteMany()
            await tx.client.deleteMany()

            // Restore data
            // We use createMany where possible, but some models have relations that might need careful ordering
            if (data.clients?.length) await tx.client.createMany({ data: data.clients })
            if (data.suppliers?.length) await tx.supplier.createMany({ data: data.suppliers })
            if (data.projects?.length) await tx.project.createMany({ data: data.projects })
            if (data.products?.length) await tx.product.createMany({ data: data.products })
            if (data.quotes?.length) await tx.quote.createMany({ data: data.quotes })
            if (data.supplierTasks?.length) await tx.supplierTask.createMany({ data: data.supplierTasks })
            if (data.supplierOrders?.length) await tx.supplierOrder.createMany({ data: data.supplierOrders })
            if (data.quoteItems?.length) await tx.quoteItem.createMany({ data: data.quoteItems })
            if (data.fixedExpenses?.length) await tx.fixedExpense.createMany({ data: data.fixedExpenses })
            if (data.incomes?.length) await tx.income.createMany({ data: data.incomes })
            if (data.variableExpenses?.length) await tx.variableExpense.createMany({ data: data.variableExpenses })
        })

        return NextResponse.json({ success: true, message: 'Backup restored successfully' })
    } catch (error) {
        console.error('Restore error:', error)
        return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 })
    }
}
