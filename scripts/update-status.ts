
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const searchTerm = 'TERMO NIBBLE'

    console.log(`Searching for project containing: "${searchTerm}"...`)

    const projects = await prisma.project.findMany({
        where: {
            name: {
                contains: searchTerm,
                mode: 'insensitive'
            }
        }
    })

    if (projects.length === 0) {
        console.log('No project found.')
        return
    }

    if (projects.length > 1) {
        console.log('Multiple projects found:', projects.map(p => `${p.id}: ${p.name}`))
        return
    }

    const project = projects[0]
    console.log(`Found project: ${project.name} (${project.id})`)
    console.log(`Current Status: ${project.status}`)
    console.log(`Financial Status: ${project.financialStatus}`)

    // Update status
    const updated = await prisma.project.update({
        where: { id: project.id },
        data: { status: 'ENTREGADO' }
    })

    console.log(`✅ Project status updated to: ${updated.status}`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
