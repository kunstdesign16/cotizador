
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const projectId = 'cmjw99wli000113nqadlm73nq'

    console.log(`Force cancelling project ID: "${projectId}"...`)

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    })

    if (!project) {
        console.error('Project not found.')
        return
    }

    console.log(`Found project: ${project.name}`)
    console.log(`Current Status: ${project.status}`)
    console.log(`Current Financial Status: ${project.financialStatus}`)

    await prisma.project.update({
        where: { id: projectId },
        data: {
            status: 'cancelled',
            financialStatus: 'ABIERTO' // Unlock just in case
        }
    })

    console.log('✅ Project status updated to "cancelled" and financial status to "ABIERTO".')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
