import { Button } from "@/components/ui/button"
import { FullBackupButtons } from "@/components/full-backup-buttons"

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-2xl space-y-8">
                <header>
                    <h1 className="text-2xl font-bold">Configuración</h1>
                    <p className="text-sm text-muted-foreground">Administración del sistema</p>
                </header>

                <div className="space-y-6">
                    {/* Database Section */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-2">Base de Datos</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Descarga una copia completa de tu información o restaura una copia anterior.
                            <br />
                            <span className="text-amber-600 font-medium">Nota: Restaurar un respaldo borrará la información actual y la reemplazará.</span>
                        </p>

                        <FullBackupButtons />
                    </div>
                </div>
            </div>
        </div>
    )
}
