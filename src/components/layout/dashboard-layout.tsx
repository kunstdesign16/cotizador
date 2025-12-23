import { Sidebar } from './sidebar'
import { DashboardContent } from './dashboard-content'
import { getCurrentUser } from '@/actions/users'

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser()

    return (
        <div className="min-h-screen bg-background">
            <Sidebar initialUser={user} />
            <DashboardContent>
                {children}
            </DashboardContent>
        </div>
    )
}
