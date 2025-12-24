import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register Custom Fonts
// Font.register({
//     family: 'Bebas Neue',
//     src: 'https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg1_i6t8kCHKm459Wlhyw.ttf'
// });

// Font.register({
//     family: 'Fira Sans',
//     fonts: [
//         { src: 'https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5Vvl4jL.ttf' }, // Regular
//         { src: 'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnRExD6XlD.ttf', fontWeight: 'bold' } // Bold
//     ]
// });

const styles = StyleSheet.create({
    page: {
        paddingGlobal: 40,
        fontFamily: 'Helvetica', // Reverted to standard font due to load error
        paddingTop: 40,
        paddingBottom: 60,
        paddingLeft: 40,
        paddingRight: 40,
        fontSize: 10,
        color: '#545555', // Gris Oscuro
        backgroundColor: '#FFFFFF'
    },
    // Background Watermark
    watermarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
        opacity: 0.03 // Muy sutil
    },
    watermark: {
        width: 500,
        height: 500,
        objectFit: 'contain'
    },
    // Draft Watermark
    draftWatermark: {
        position: 'absolute',
        fontSize: 120,
        color: '#E11D48', // Rose-600
        opacity: 0.1,
        transform: 'rotate(-45deg)',
        // fontFamily: 'Bebas Neue',
        fontWeight: 'bold',
        width: 800,
        textAlign: 'center',
        top: 300,
        left: -100
    },
    // Header
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 20
    },
    logo: {
        width: 160, // Aumentado para protagonismo
        height: 'auto'
    },
    headerInfo: {
        alignItems: 'flex-end',
        textAlign: 'right'
    },
    headerCityDate: {
        fontSize: 9,
        color: '#545555',
        marginBottom: 2
    },
    // Project Info Block
    projectInfoContainer: {
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderRadius: 4
    },
    projectInfoColumn: {
        flex: 1
    },
    projectTitle: {
        // fontFamily: 'Bebas Neue',
        fontWeight: 'bold', // Replacement for Bebas style
        fontSize: 24,
        color: '#284960', // Azul Institucional
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    clientName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#284960',
        marginBottom: 2
    },
    clientDetail: {
        fontSize: 10,
        color: '#64748B'
    },

    // Table
    table: {
        width: '100%',
        marginBottom: 20,
        marginTop: 10
    },
    tableHeaderNode: {
        flexDirection: 'row',
        backgroundColor: '#284960', // Azul Institucional
        color: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 6,
        alignItems: 'center',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4
    },
    tableHeaderText: {
        // fontFamily: 'Bebas Neue',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 0.5
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingVertical: 10,
        paddingHorizontal: 6,
        alignItems: 'center'
    },
    tableRowAlt: {
        backgroundColor: '#F8FAFC'
    },
    // Columns
    colQty: { width: '10%', textAlign: 'center' },
    colDesc: { width: '50%', textAlign: 'left', paddingRight: 10 },
    colUnit: { width: '20%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },

    // Totals Section
    totalsContainer: {
        alignItems: 'flex-end',
        marginTop: 20
    },
    totalRow: {
        flexDirection: 'row',
        width: '40%',
        justifyContent: 'space-between',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    totalLabel: {
        // fontFamily: 'Bebas Neue',
        fontWeight: 'bold',
        fontSize: 12,
        color: '#545555',
        textAlign: 'right',
        width: '60%'
    },
    totalValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#545555',
        textAlign: 'right',
        width: '40%'
    },
    totalFinalRow: {
        flexDirection: 'row',
        width: '40%',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 8,
        backgroundColor: '#284960', // Azul destaque
        marginTop: 10,
        borderRadius: 4
    },
    totalFinalLabel: {
        // fontFamily: 'Bebas Neue',
        fontWeight: 'bold',
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'right',
        width: '60%'
    },
    totalFinalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'right',
        width: '40%'
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 10
    },
    footerText: {
        // fontFamily: 'Bebas Neue',
        fontSize: 12,
        color: '#284960',
        letterSpacing: 1
    }
});

// Helper to format currency
const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const QuoteDocument = ({ quote }: { quote: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Watermark */}
            <View style={styles.watermarkContainer}>
                <Image src="/logo.svg" style={styles.watermark} />
            </View>

            {/* Draft Status Watermark */}
            {quote.status !== 'APPROVED' && (
                <View style={styles.watermarkContainer}>
                    <Text style={styles.draftWatermark}>PRELIMINAR</Text>
                </View>
            )}

            {/* Header */}
            <View style={styles.headerContainer}>
                <Image src="/logo.svg" style={styles.logo} />
                <View style={styles.headerInfo}>
                    <Text style={styles.headerCityDate}>Guadalajara, Jalisco</Text>
                    <Text style={styles.headerCityDate}>{new Date(quote.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                </View>
            </View>

            {/* Project Info */}
            <View style={styles.projectInfoContainer}>
                <View style={styles.projectInfoColumn}>
                    <Text style={[styles.clientDetail, { marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }]}>Proyecto</Text>
                    <Text style={styles.projectTitle}>{quote.project_name}</Text>
                </View>
                <View style={[styles.projectInfoColumn, { alignItems: 'flex-end' }]}>
                    <Text style={[styles.clientDetail, { marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }]}>Cliente</Text>
                    <Text style={styles.clientName}>
                        {quote.client?.company || quote.client?.name}
                    </Text>
                    {quote.client?.company && (
                        <Text style={styles.clientDetail}>{quote.client.name}</Text>
                    )}
                </View>
            </View>

            {/* Table */}
            <View style={styles.table}>
                <View style={styles.tableHeaderNode}>
                    <Text style={[styles.colQty, styles.tableHeaderText]}>CANT.</Text>
                    <Text style={[styles.colDesc, styles.tableHeaderText]}>CONCEPTO / DESCRIPCIÓN</Text>
                    <Text style={[styles.colUnit, styles.tableHeaderText]}>PRECIO U.</Text>
                    <Text style={[styles.colTotal, styles.tableHeaderText]}>IMPORTE</Text>
                </View>

                {quote.items?.map((item: any, i: number) => (
                    <View style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowAlt : {}]} key={i}>
                        <Text style={styles.colQty}>{item.quantity}</Text>
                        <Text style={styles.colDesc}>{item.concept}</Text>
                        <Text style={styles.colUnit}>{formatCurrency(item.unit_cost)}</Text>
                        <Text style={styles.colTotal}>{formatCurrency(item.subtotal)}</Text>
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={styles.totalsContainer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
                </View>

                {quote.iva_amount > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>IVA (16%)</Text>
                        <Text style={styles.totalValue}>{formatCurrency(quote.iva_amount)}</Text>
                    </View>
                )}

                {quote.isr_amount > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Retenciones (ISR)</Text>
                        <Text style={styles.totalValue}>{formatCurrency(quote.isr_amount)}</Text>
                    </View>
                )}

                <View style={styles.totalFinalRow}>
                    <Text style={styles.totalFinalLabel}>IMPORTE TOTAL</Text>
                    <Text style={styles.totalFinalValue}>{formatCurrency(quote.total)}</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Desarrollando ideas, creando sueños.</Text>
            </View>
        </Page>
    </Document>
);
