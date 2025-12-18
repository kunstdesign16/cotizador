'use server'

import { revalidatePath } from 'next/cache'

export async function createExpense(data: {
    description: string
    amount: number
    category?: string
    date?: Date
    recurring?: boolean
    const { prisma } = await import('@/lib/prisma')
    try {
    const expense = await prisma.fixedExpense.create({
        data: {
            description: data.description,
            amount: data.amount,
            category: data.category || null,
            date: data.date || new Date(),
            recurring: data.recurring || false
        }
    })
    revalidatePath('/expenses')
    revalidatePath('/accounting')
    return { success: true, id: expense.id }
} catch (error) {
    console.error('Error creating expense:', error)
    return { success: false, error: 'Error al crear gasto' }
}
}

export async function updateExpense(id: string, data: {
    description?: string
    amount?: number
    category?: string
    date?: Date
    recurring?: boolean
    const { prisma } = await import('@/lib/prisma')
    try {
    await prisma.fixedExpense.update({
        where: { id },
        data
    })
    revalidatePath('/expenses')
    revalidatePath('/accounting')
    return { success: true }
} catch (error) {
    console.error('Error updating expense:', error)
    return { success: false, error: 'Error al actualizar gasto' }
}
}

const { prisma } = await import('@/lib/prisma')
try {
    await prisma.fixedExpense.delete({
        where: { id }
    })
    revalidatePath('/expenses')
    revalidatePath('/accounting')
    return { success: true }
} catch (error) {
    console.error('Error deleting expense:', error)
    return { success: false, error: 'Error al eliminar gasto' }
}
}

const { prisma } = await import('@/lib/prisma')
try {
    let dateFilter = {}
    // ... (rest of filtering logic)
    const expenses = await prisma.fixedExpense.findMany({
        where: dateFilter,
        orderBy: { date: 'desc' }
    })
    return { success: true, expenses }
} catch (error) {
    console.error('Error fetching expenses:', error)
    return { success: false, expenses: [] }
}
}
