import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function QuotePDFClient({ quote }: { quote: any }) {
    const pdfUrl = `/quotes/${quote.id}/pdf`;
    const fileName = `Cotizacion_${quote.project_name.replace(/[^a-z0-9]/gi, '_')}.pdf`;

    return (
        <a href={pdfUrl} download={fileName} target="_blank" rel="noopener noreferrer">
            <Button variant="default" className="gap-2">
                <Download className="h-4 w-4" />
                Descargar Documento PDF
            </Button>
        </a>
    )
}
