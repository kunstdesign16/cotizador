
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const searchTerm = 'Calendarios de pared (400)'

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

    projects.forEach(project => {
        console.log(`\nFound project: ${project.name} (${project.id})`)
        console.log(`- Status: ${project.status}`)
        console.log(`- Financial Status: ${project.financialStatus}`)
        console.log(`- Quotes: ${project.quotes.length}`)
        console.log(`- Supplier Orders: ${project.supplierOrders.length}`)
        console.log(`- Incomes: ${project.incomes.length}`)
        console.log(`- Expenses: ${project.expenses.length}`)
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
