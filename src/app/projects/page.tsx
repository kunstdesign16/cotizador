import { ProjectsPageClient } from '@/components/projects-page-client'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
    try {
        const { prisma } = await import('@/lib/prisma')

        const projects = await (prisma as any).project.findMany({
            include: {
                client: true,
                quotes: {
                    orderBy: { version: 'desc' },
                    take: 1
                }
            } as any,
            orderBy: { updatedAt: 'desc' }
        })

        const clients = await prisma.client.findMany({
            orderBy: { name: 'asc' }
        })

        const serializedProjects = JSON.parse(JSON.stringify(projects))
        const serializedClients = JSON.parse(JSON.stringify(clients))

        return <ProjectsPageClient initialProjects={serializedProjects} clients={serializedClients} />
    } catch (error: any) {
        console.error('Error in ProjectsPage:', error)
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-xl font-bold text-red-600">Error en Proyectos</h1>
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <div className="p-4 bg-muted rounded text-[10px] font-mono whitespace-pre-wrap text-left max-h-[200px] overflow-auto">
                    {error.stack}
                </div>
            </div>
        )
    }
}
