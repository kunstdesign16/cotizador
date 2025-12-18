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

    let summary = { incomes: [], variableExpenses: [], fixedExpenses: [] }

    try {
        summary = await getAccountingSummary(month)
    } catch (error) {
        console.error("Error fetching accounting data:", error)
        // Fallback or empty state will be handled by UI
    }

    // Serialize for Client Component
    const serializedSummary = JSON.parse(JSON.stringify(summary))

    return (
        <div className="container mx-auto py-8">
            <AccountingDashboard summary={serializedSummary} month={month} />
        </div>
    )
}
