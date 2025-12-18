
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function ReportsPage() {
    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
            </div>

            <Card className="w-full h-[400px] flex items-center justify-center border-dashed">
                <CardContent className="flex flex-col items-center gap-4 text-muted-foreground">
                    <BarChart3 className="h-16 w-16 opacity-20" />
                    <p className="text-xl font-medium">Próximamente</p>
                    <p className="text-sm">Esta sección está en desarrollo.</p>
                </CardContent>
            </Card>
        </div>
    )
}
