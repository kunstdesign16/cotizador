import { ProjectsPageClient } from '@/components/projects-page-client'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
    const { prisma } = await import('@/lib/prisma')

    const quotes = await prisma.quote.findMany({
        include: { client: true },
        orderBy: { updatedAt: 'desc' }
    })

    const serializedQuotes = JSON.parse(JSON.stringify(quotes))

    return <ProjectsPageClient initialQuotes={serializedQuotes} />
}
