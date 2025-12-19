import { AccountingDashboard } from '@/components/accounting/dashboard'
import { getAccountingSummary } from '@/actions/accounting'

// Allow searchParams
export const dynamic = 'force-dynamic'

export default async function AccountingPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    // Default to current month if not specified
    const month = typeof searchParams?.month === 'string' ? searchParams.month : new Date().toISOString().slice(0, 7)

    let summary: any = { incomes: [], variableExpenses: [], fixedExpenses: [] }
    let trends: any[] = []
    let projects: any[] = []

    try {
        const { getAccountingTrends } = await import('@/actions/accounting')
        const { getActiveProjects } = await import('@/actions/quotes')
        summary = await getAccountingSummary(month)
        trends = await getAccountingTrends()
        projects = await getActiveProjects()
    } catch (error) {
        console.error("Error fetching accounting data:", error)
    }

    const serializedSummary = JSON.parse(JSON.stringify(summary))
    const serializedTrends = JSON.parse(JSON.stringify(trends))
    const serializedProjects = JSON.parse(JSON.stringify(projects))

    return (
        <div className="container mx-auto py-8">
            <AccountingDashboard
                summary={serializedSummary}
                trends={serializedTrends}
                projects={serializedProjects}
                month={month}
            />
        </div>
    )
}
