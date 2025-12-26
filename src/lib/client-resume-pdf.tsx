import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { sharedStyles, PDFHeader, PDFFooter, PDFWatermark } from './pdf-shared';

const styles = StyleSheet.create({
    ...sharedStyles,
    titleContainer: {
        marginTop: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#284960',
        textTransform: 'uppercase',
    },
    clientInfoBlock: {
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderRadius: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    clientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#284960',
        marginBottom: 4,
    },
    clientDetail: {
        fontSize: 10,
        color: '#64748B',
        marginBottom: 2,
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
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    metricCard: {
        width: '33.33%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 8,
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    metricValue: {
        fontSize: 14,
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

export const ClientResumeDocument = ({ data }: {
    data: {
        client: { name: string; company?: string; email: string; phone: string; createdAt: string };
        metrics: { totalProyectos: number; totalCotizaciones: number; totalIngresos: number };
        projectsByStatus: { cotizando: number; aprobado: number; produccion: number; entregado: number; cerrado: number };
        projects?: Array<{ id: string; name: string; createdAt: string; status: string; quotes?: Array<{ total: number }> }>;
    }
}) => {
    const { client, metrics, projectsByStatus, projects } = data;

    return (
        <Document title={`Hoja de Vida - ${client.name}`}>
            <Page size="LETTER" style={styles.page}>
                <PDFWatermark isApproved={true} />
                <PDFHeader date={new Date()} />

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Hoja de Vida del Cliente</Text>
                </View>

                <View style={styles.clientInfoBlock}>
                    <Text style={styles.clientName}>{client.company || client.name}</Text>
                    {client.company && <Text style={styles.clientDetail}>Atención: {client.name}</Text>}
                    <Text style={styles.clientDetail}>Email: {client.email}</Text>
                    <Text style={styles.clientDetail}>Teléfono: {client.phone}</Text>
                    <Text style={styles.clientDetail}>Cliente desde: {new Date(client.createdAt).toLocaleDateString()}</Text>
                </View>

                <Text style={styles.sectionTitle}>Métricas Globales</Text>
                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Proyectos Totales</Text>
                        <Text style={styles.metricValue}>{metrics.totalProyectos}</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Cotizaciones</Text>
                        <Text style={styles.metricValue}>{metrics.totalCotizaciones}</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Inversión Total</Text>
                        <Text style={styles.metricValue}>{formatCurrency(metrics.totalIngresos)}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Estatus de Proyectos</Text>
                <View style={[styles.metricsGrid, { marginBottom: 10 }]}>
                    <View style={[styles.metricCard, { width: '20%' }]}>
                        <Text style={styles.metricLabel}>Cotizando</Text>
                        <Text style={styles.metricValue}>{projectsByStatus.cotizando}</Text>
                    </View>
                    <View style={[styles.metricCard, { width: '20%' }]}>
                        <Text style={styles.metricLabel}>Aprobado</Text>
                        <Text style={styles.metricValue}>{projectsByStatus.aprobado}</Text>
                    </View>
                    <View style={[styles.metricCard, { width: '20%' }]}>
                        <Text style={styles.metricLabel}>Producción</Text>
                        <Text style={styles.metricValue}>{projectsByStatus.produccion}</Text>
                    </View>
                    <View style={[styles.metricCard, { width: '20%' }]}>
                        <Text style={styles.metricLabel}>Entregado</Text>
                        <Text style={styles.metricValue}>{projectsByStatus.entregado}</Text>
                    </View>
                    <View style={[styles.metricCard, { width: '20%' }]}>
                        <Text style={styles.metricLabel}>Cerrado</Text>
                        <Text style={styles.metricValue}>{projectsByStatus.cerrado}</Text>
                    </View>
                </View>

                {projects && projects.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Últimos Proyectos</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.col1, { color: '#FFF', fontWeight: 'bold' }]}>Nombre del Proyecto</Text>
                                <Text style={[styles.col2, { color: '#FFF', fontWeight: 'bold' }]}>Fecha</Text>
                                <Text style={[styles.col3, { color: '#FFF', fontWeight: 'bold' }]}>Estatus</Text>
                                <Text style={[styles.col4, { color: '#FFF', fontWeight: 'bold' }]}>Total</Text>
                            </View>
                            {projects.slice(0, 8).map((p: any) => (
                                <View key={p.id} style={styles.tableRow}>
                                    <Text style={[styles.col1, styles.tableCell]}>{p.name}</Text>
                                    <Text style={[styles.col2, styles.tableCell]}>{new Date(p.createdAt).toLocaleDateString()}</Text>
                                    <Text style={[styles.col3, styles.tableCell]}>{p.status}</Text>
                                    <Text style={[styles.col4, styles.tableCell]}>{formatCurrency(p.quotes?.[0]?.total || 0)}</Text>
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
