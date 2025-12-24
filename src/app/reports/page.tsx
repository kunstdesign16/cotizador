import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { FileText, Download, Filter, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function ReportsPage() {
    const session = await auth()
    if (!session || session.user?.role !== 'admin') {
        redirect('/dashboard')
    }

    const availableReports = [
        {
            title: "Status General de Obra",
            description: "Resumen ejecutivo de todos los proyectos activos, incluyendo avances físicos y financieros.",
            icon: FileText,
            format: "PDF",
            category: "Operaciones"
        },
        {
            title: "Cierre Fiscal de Proyecto",
            description: "Auditoría completa de ingresos vs egresos para proyectos marcados como finalizados.",
            icon: Download,
            format: "EXCEL/PDF",
            category: "Finanzas"
        },
        {
            title: "Kárdex de Proveedores",
            description: "Historial detallado de compras y pagos realizados por proveedor en un rango de fechas.",
            icon: Filter,
            format: "EXCEL",
            category: "Contabilidad"
        }
    ]

    return (
        <div className="space-y-10 p-4 sm:p-8">
            <header className="border-b border-secondary pb-6">
                <h1 className="text-5xl font-brand-header text-primary tracking-tight">Centro de Reportes</h1>
                <p className="text-base text-foreground/70 font-brand-ui">Generación y descarga de documentos corporativos</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {availableReports.map((report) => (
                    <Card key={report.title} className="rounded-3xl border border-secondary bg-white shadow-lg overflow-hidden flex flex-col hover:shadow-primary/5 transition-all group">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-3 rounded-2xl bg-secondary/30 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <report.icon className="h-6 w-6" />
                                </div>
                                <Badge className="bg-primary/10 text-primary border-0 font-brand-header tracking-tighter text-[10px] uppercase">
                                    {report.format}
                                </Badge>
                            </div>
                            <CardTitle className="text-2xl font-brand-header text-primary tracking-wide">
                                {report.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between space-y-6">
                            <p className="text-sm text-foreground/70 font-brand-ui leading-relaxed">
                                {report.description}
                            </p>
                            <div className="space-y-3">
                                <p className="text-[10px] font-brand-header text-primary/40 uppercase tracking-widest">
                                    Categoría: {report.category}
                                </p>
                                <Button className="w-full rounded-xl font-brand-header tracking-widest uppercase text-xs h-10 shadow-lg shadow-primary/10" variant="outline">
                                    <Download className="h-4 w-4 mr-2" /> Generar Reporte
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <section className="bg-secondary/20 rounded-3xl p-8 border border-dashed border-secondary/60">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <Calendar className="h-12 w-12 text-primary/30" />
                    <div>
                        <h3 className="text-xl font-brand-header text-primary tracking-wide">Configuración de Reportes Programados</h3>
                        <p className="text-sm text-foreground/50 font-brand-ui">Próximamente: Recibe balances automáticos en tu correo cada lunes.</p>
                    </div>
                </div>
            </section>
        </div>
    )
}
