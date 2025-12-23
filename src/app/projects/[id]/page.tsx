import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectHubClient } from '@/components/project-hub-client'

export const dynamic = 'force-dynamic'

interface ProjectPageProps {
    params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            client: true,
            user: true,
            quotes: {
                include: { items: true },
                orderBy: { version: 'desc' }
            },
            supplierOrders: {
                include: {
                    supplier: true,
                    expenses: true
                }
            },
            supplierTasks: {
                include: { supplier: true }
            },
            incomes: true,
            expenses: {
                include: { supplier: true }
            }
        }
    })

    if (!project) {
        notFound()
    }

    const serializedProject = JSON.parse(JSON.stringify(project))

    return <ProjectHubClient project={serializedProject} />
}
