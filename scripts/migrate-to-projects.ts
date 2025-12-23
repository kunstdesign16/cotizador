import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Starting Migration: Quotes to Projects ---')

    // 1. Fetch all quotes with their related entities
    const quotes = await prisma.quote.findMany({
        include: {
            supplierOrders: true,
            supplierTasks: true,
            incomes: true,
            expenses: true,
        }
    })

    console.log(`Found ${quotes.length} quotes to migrate.`)

    for (const quote of quotes) {
        if (quote.projectId) {
            console.log(`Skipping quote ${quote.id} (already has projectId)`)
            continue
        }

        try {
            // 2. Create a Project based on the Quote
            // Map Quote status to Project status
            let projectStatus = 'COTIZANDO'
            if (['APPROVED', 'FACTURADO', 'COBRADO'].includes(quote.status)) {
                projectStatus = 'APROBADO'
            }

            const project = await prisma.project.create({
                data: {
                    name: quote.project_name,
                    clientId: quote.clientId,
                    userId: quote.userId,
                    status: projectStatus,
                    createdAt: quote.createdAt,
                    updatedAt: quote.updatedAt,
                    // Initialize financials from quote total
                    totalCotizado: quote.total,
                }
            })

            console.log(`Created project "${project.name}" for quote ${quote.id}`)

            // 3. Link Quote to Project
            await prisma.quote.update({
                where: { id: quote.id },
                data: { projectId: project.id }
            })

            // 4. Link SupplierOrders to Project
            if (quote.supplierOrders.length > 0) {
                await prisma.supplierOrder.updateMany({
                    where: { quoteId: quote.id },
                    data: { projectId: project.id }
                })
            }

            // 5. Link SupplierTasks to Project
            if (quote.supplierTasks.length > 0) {
                await prisma.supplierTask.updateMany({
                    where: { quoteId: quote.id },
                    data: { projectId: project.id }
                })
            }

            // 6. Link Incomes to Project
            if (quote.incomes.length > 0) {
                await prisma.income.updateMany({
                    where: { quoteId: quote.id },
                    data: { projectId: project.id }
                })
            }

            // 7. Link VariableExpenses to Project
            if (quote.expenses.length > 0) {
                await prisma.variableExpense.updateMany({
                    where: { quoteId: quote.id },
                    data: { projectId: project.id }
                })
            }

            console.log(`Successfully migrated quote ${quote.id} and its relations.`)
        } catch (error) {
            console.error(`Failed to migrate quote ${quote.id}:`, error)
        }
    }

    console.log('--- Migration Finished ---')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
