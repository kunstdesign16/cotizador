'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { QuoteDocument } from '@/lib/pdf'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function QuotePDFClient({ quote }: { quote: any }) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return <Button variant="default" disabled>Cargando PDF...</Button>
    }

    return (
        <PDFDownloadLink
            document={<QuoteDocument quote={quote} />}
            fileName={`cotizacion-${quote.project_name}.pdf`}
        >
            {({ url, loading, error }) => {
                if (error) {
                    console.error('PDF Generation Error:', error)
                    return (
                        <Button variant="default" className="gap-2 bg-red-600 hover:bg-red-700">
                            Error al generar
                        </Button>
                    )
                }

                if (loading) {
                    return (
                        <Button variant="outline" className="gap-2" disabled>
                            <Download className="h-4 w-4 animate-pulse" />
                            Generando PDF...
                        </Button>
                    )
                }

                return (
                    <a href={url || '#'} download={`cotizacion-${quote.project_name}.pdf`} target="_blank" rel="noopener noreferrer">
                        <Button variant="default" className="gap-2">
                            <Download className="h-4 w-4" />
                            Descargar PDF
                        </Button>
                    </a>
                )
            }}
        </PDFDownloadLink>
    )
}
