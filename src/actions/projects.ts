'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createProject(data: { name: string; clientId: string; description?: string }) {
    const project = await prisma.project.create({
        data: {
            name: data.name,
            clientId: data.clientId,
            description: data.description,
            status: 'COTIZANDO'
        }
    })

    revalidatePath('/projects')
    return project
}
