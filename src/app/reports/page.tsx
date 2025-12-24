import { cookies } from 'next/headers'
import { redirect } from "next/navigation"
import { ReportsClient } from "@/components/reports-client"

export default async function ReportsPage() {
    const cookieStore = await cookies()
    const role = cookieStore.get('user_role')?.value

    if (role !== 'admin') {
        redirect('/dashboard')
    }

    return <ReportsClient />
}
