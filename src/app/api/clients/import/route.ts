import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return new NextResponse('No file uploaded', { status: 400 })
        }

        const text = await file.text()
        const rows = text.split('\n')

        // Simple CSV parser (handling basic quotes)
        // Assumption: Our export format is simple. 
        // Row 0 is header.

        const promises: any[] = []

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim()
            if (!row) continue

            // Regex to split by comma but ignore commas inside quotes
            const cols = row.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g)
            if (!cols) continue

            const cleanCols = cols.map(col => {
                let val = col.startsWith(',') ? col.slice(1) : col
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.slice(1, -1).replace(/""/g, '"')
                }
                return val.trim()
            })

            // Indexes based on Export: ID(0), Name(1), Company(2), Email(3), Phone(4)
            const name = cleanCols[1]
            const company = cleanCols[2]
            const email = cleanCols[3]
            const phone = cleanCols[4]

            if (!name) continue

            const promise = async () => {
                // Upsert logic (same as before)
                if (email) {
                    const existing = await prisma.client.findFirst({ where: { email } })
                    if (existing) {
                        await prisma.client.update({
                            where: { id: existing.id },
                            data: { name, company, phone }
                        })
                        return
                    }
                }

                const existingByName = await prisma.client.findFirst({ where: { name } })
                if (existingByName) {
                    await prisma.client.update({
                        where: { id: existingByName.id },
                        data: { company, email, phone }
                    })
                    return
                }

                await prisma.client.create({
                    data: { name, company, email, phone }
                })
            }
            promises.push(promise())
        }

        await Promise.all(promises)

        revalidatePath('/clients')
        return NextResponse.json({ success: true, count: promises.length })

    } catch (error) {
        console.error('Error importing clients:', error)
        return new NextResponse('Error importing clients', { status: 500 })
    }
}
