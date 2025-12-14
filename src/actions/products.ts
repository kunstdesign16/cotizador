
'use server'

import { prisma } from '@/lib/prisma'

export async function searchProducts(query: string) {
    if (!query || query.length < 2) return []

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { code: { contains: query, mode: 'insensitive' } }
            ]
        },
        take: 20,
        orderBy: { name: 'asc' }
    })

    return products
}
