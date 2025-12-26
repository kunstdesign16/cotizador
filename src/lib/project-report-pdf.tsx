import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { sharedStyles, PDFHeader, PDFFooter, PDFWatermark } from './pdf-shared';

const styles = StyleSheet.create({
    ...sharedStyles,
    titleContainer: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#284960',
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#284960',
        backgroundColor: '#F1F5F9',
        padding: 6,
        marginTop: 15,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#284960',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    gridItem: {
        width: '25%',
        padding: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    gridLabel: {
        fontSize: 8,
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    gridValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#284960',
    },
    table: {
        width: '100%',
        marginTop: 5,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#284960',
        color: '#FFFFFF',
        padding: 6,
        alignItems: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        padding: 6,
        alignItems: 'center',
    },
    tableCell: {
        fontSize: 9,
    },
    col1: { width: '40%' },
    col2: { width: '20%', textAlign: 'center' },
    col3: { width: '20%', textAlign: 'center' },
    col4: { width: '20%', textAlign: 'right' },
});

const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const ProjectReportDocument = ({ data }: {
    data: {
        project: { name: string; status: string; id: string };
        client: { name: string; company?: string };
        financial: { totalIngresos: number; totalEgresos: number; utilidad: number; margenUtilidad: number };
        quotes: { total: number; approved: number; totalCotizado: number };
        tasks: { total: number; completed: number };
        orders: { total: number; received: number };
        quotesDetail?: Array<{ id: string; project_name: string; date: string; status: string; total: number }>;
    }
}) => {
    const { project, client, financial, quotes, tasks, orders } = data;

    return (
        <Document title={`Reporte - ${project.name}`}>
            <Page size="LETTER" style={styles.page}>
                <PDFWatermark isApproved={true} />
                <PDFHeader date={new Date()} />

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Reporte de Estatus de Proyecto</Text>
                    <Text style={styles.subtitle}>{project.name} | {client.company || client.name}</Text>
                </View>

                <Text style={styles.sectionTitle}>Resumen Financiero</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Total Ingresos</Text>
                        <Text style={styles.gridValue}>{formatCurrency(financial.totalIngresos)}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Total Egresos</Text>
                        <Text style={styles.gridValue}>{formatCurrency(financial.totalEgresos)}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Utilidad</Text>
                        <Text style={[styles.gridValue, { color: financial.utilidad >= 0 ? '#10B981' : '#EF4444' }]}>
                            {formatCurrency(financial.utilidad)}
                        </Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Margen</Text>
                        <Text style={styles.gridValue}>{financial.margenUtilidad}%</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Estatus de Operaciones</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Cotizaciones</Text>
                        <Text style={styles.gridValue}>{quotes.total}</Text>
                        <Text style={{ fontSize: 7, color: '#64748B' }}>{quotes.approved} Aprobadas</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Tareas</Text>
                        <Text style={styles.gridValue}>{tasks.total}</Text>
                        <Text style={{ fontSize: 7, color: '#64748B' }}>{tasks.completed} Completadas</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Órdenes</Text>
                        <Text style={styles.gridValue}>{orders.total}</Text>
                        <Text style={{ fontSize: 7, color: '#64748B' }}>{orders.received} Recibidas</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Estatus Proyecto</Text>
                        <Text style={[styles.gridValue, { fontSize: 10 }]}>{project.status}</Text>
                    </View>
                </View>

                {data.quotesDetail && data.quotesDetail.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Detalle de Cotizaciones</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.col1, { color: '#FFF', fontWeight: 'bold', fontSize: 10 }]}>Proyecto / Ref</Text>
                                <Text style={[styles.col2, { color: '#FFF', fontWeight: 'bold', fontSize: 10 }]}>Fecha</Text>
                                <Text style={[styles.col3, { color: '#FFF', fontWeight: 'bold', fontSize: 10 }]}>Estatus</Text>
                                <Text style={[styles.col4, { color: '#FFF', fontWeight: 'bold', fontSize: 10 }]}>Total</Text>
                            </View>
                            {data.quotesDetail.map((q: { id: string; project_name: string; date: string; status: string; total: number }) => (
                                <View key={q.id} style={styles.tableRow}>
                                    <Text style={[styles.col1, styles.tableCell]}>{q.project_name}</Text>
                                    <Text style={[styles.col2, styles.tableCell]}>{new Date(q.date).toLocaleDateString()}</Text>
                                    <Text style={[styles.col3, styles.tableCell]}>{q.status}</Text>
                                    <Text style={[styles.col4, styles.tableCell]}>{formatCurrency(q.total)}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                <PDFFooter />
            </Page>
        </Document>
    );
};
