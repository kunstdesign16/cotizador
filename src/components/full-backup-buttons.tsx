'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function FullBackupButtons() {
    const [restoring, setRestoring] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleDownload = () => {
        window.location.href = '/api/backup/export'
    }

    const handleRestoreClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!confirm(`PELIGRO: ¿Estás seguro de restaurar el respaldo?\n\nESTO BORRARÁ TODA LA INFORMACIÓN ACTUAL y la reemplazará con la del archivo.\n\nEsta acción no se puede deshacer.`)) {
            e.target.value = ''
            return
        }

        setRestoring(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/backup/import', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Error en la restauración')

            alert('Sistema restaurado exitosamente')
            router.refresh()
            router.push('/dashboard')
        } catch (error) {
            console.error(error)
            alert('Falló la restauración. Revisa la consola o el formato del archivo.')
        } finally {
            setRestoring(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row">
            <Button onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Descargar Respaldo Completo (.json)
            </Button>

            <div className="relative">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleFileChange}
                />
                <Button variant="outline" onClick={handleRestoreClick} disabled={restoring} className="gap-2 w-full sm:w-auto text-destructive border-destructive hover:bg-destructive/10">
                    <Upload className="h-4 w-4" />
                    {restoring ? 'Restaurando...' : 'Restaurar Base de Datos'}
                </Button>
            </div>
        </div>
    )
}
