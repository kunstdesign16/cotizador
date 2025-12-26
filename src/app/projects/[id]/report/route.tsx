import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { ProjectReportDocument } from '@/lib/project-report-pdf';
import { getProjectReport } from '@/actions/reports';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // Fetch report data using the existing action
        const result = await getProjectReport(id);

        if (!result.success || !result.report) {
            return NextResponse.json(
                { error: result.error || 'Report not found' },
                { status: 404 }
            );
        }

        // Render PDF directly to stream
        const stream = await renderToStream(
            <ProjectReportDocument data={ result.report } />
        );

        // Return PDF response
        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Reporte_Proyecto_${id}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('Error in PDF route:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
