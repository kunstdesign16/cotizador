
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const searchTerm = 'IGUALA MENSUAL'

    console.log(`Searching for project: "${searchTerm}"...`)

    const projects = await prisma.project.findMany({
        where: {
            name: {
                contains: searchTerm,
                mode: 'insensitive'
            }
        },
        include: {
            quotes: true,
            supplierOrders: true,
            incomes: true,
            expenses: true
        }
    })

    if (projects.length === 0) {
        console.log('No project found.')
        return
    }

    const project = projects[0]
    console.log(`Found project: ${project.name} (${project.id})`)
    console.log(`- Quotes: ${project.quotes.length}`)
    console.log(`- Supplier Orders: ${project.supplierOrders.length}`)
    console.log(`- Incomes: ${project.incomes.length}`)
    console.log(`- Expenses: ${project.expenses.length}`)

    console.log('Deleting related records...')

    // Manual cascade delete just in case
    await prisma.quote.deleteMany({ where: { projectId: project.id } })
    await prisma.supplierOrder.deleteMany({ where: { projectId: project.id } })
    await prisma.income.deleteMany({ where: { projectId: project.id } })
    await prisma.variableExpense.deleteMany({ where: { projectId: project.id } })

    console.log('Deleting project...')
    await prisma.project.delete({
        where: { id: project.id }
    })

    console.log('✅ Project deleted successfully.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
