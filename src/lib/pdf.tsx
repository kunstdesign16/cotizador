import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a standard font if we want custom, but Helvetica is default and safe.

const styles = StyleSheet.create({
    page: {
        paddingGlobal: 40, // Padding for content
        fontFamily: 'Helvetica',
        paddingTop: 40,
        paddingBottom: 60,
        paddingLeft: 40,
        paddingRight: 40,
        fontSize: 10,
        color: '#333'
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
        opacity: 0.05 // Very faint
    },
    watermark: {
        width: 400,
        height: 400,
        objectFit: 'contain'
    },
    // Header
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        alignItems: 'flex-start'
    },
    logo: {
        width: 120, // Adjust based on SVG aspect ratio
        height: 'auto'
    },
    headerInfo: {
        alignItems: 'flex-end',
        textAlign: 'right'
    },
    // Title
    titleContainer: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10
    },
    titleText: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4
    },
    // Table
    table: {
        width: '100%',
        marginBottom: 20
    },
    tableHeaderNode: {
        flexDirection: 'row',
        backgroundColor: '#1E293B', // Dark Navy Blue from reference
        color: '#FFFFFF',
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: 'center'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: 'center'
    },
    tableRowAlt: {
        backgroundColor: '#F8FAFC'
    },
    // Columns (Flexible widths)
    colDate: { width: '15%', textAlign: 'center' },
    colProject: { width: '45%' },
    colQty: { width: '10%', textAlign: 'center' },
    colUnit: { width: '15%', textAlign: 'right' },
    colTotal: { width: '15%', textAlign: 'right' },

    // Totals Section
    totalsContainer: {
        alignItems: 'flex-end',
        marginTop: 10
    },
    totalRow: {
        flexDirection: 'row',
        width: '50%', // Occupy right half
        justifyContent: 'flex-end',
        paddingVertical: 4,
        paddingHorizontal: 4
    },
    totalRowGray: {
        backgroundColor: '#E2E8F0', // Light gray band from reference
        borderRadius: 2
    },
    totalLabel: {
        width: '60%',
        textAlign: 'right',
        marginRight: 10,
        fontWeight: 'bold',
        fontSize: 9
    },
    totalValue: {
        width: '40%',
        textAlign: 'right',
        fontWeight: 'bold',
        fontSize: 9
    },
    totalFinal: {
        fontSize: 11
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#64748B',
        fontSize: 8,
        borderTopWidth: 0 // Clean footer
    }
});

// Helper to format currency
const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const QuoteDocument = ({ quote }: { quote: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Watermark Background */}
            <View style={styles.watermarkContainer}>
                {/* Reusing logo as watermark pattern */}
                <Image src="/logo.svg" style={styles.watermark} />
            </View>

            {/* Header */}
            <View style={styles.headerContainer}>
                <Image src="/logo.svg" style={styles.logo} />
                <View style={styles.headerInfo}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>Guadalajara, Jalisco</Text>
                    <Text style={{ fontSize: 10 }}>{new Date(quote.date).toLocaleDateString()}</Text>
                </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>
                    Cotización "{quote.project_name}" {quote.client?.company ? quote.client.company.toUpperCase() : ''}
                </Text>
            </View>

            {/* Table Header */}
            <View style={styles.table}>
                <View style={styles.tableHeaderNode}>
                    <Text style={styles.colDate}>Fecha solicitud</Text>
                    <Text style={styles.colProject}>Concepto / Proyecto</Text>
                    <Text style={styles.colQty}>Cantidad</Text>
                    <Text style={styles.colUnit}>Costo U.</Text>
                    <Text style={styles.colTotal}>Costo Total</Text>
                </View>

                {/* Table Rows */}
                {quote.items?.map((item: any, i: number) => (
                    <View style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowAlt : {}]} key={i}>
                        <Text style={styles.colDate}>{new Date(quote.date).toLocaleDateString()}</Text>
                        <Text style={styles.colProject}>{item.concept}</Text>
                        <Text style={styles.colQty}>{item.quantity}</Text>
                        <Text style={styles.colUnit}>{formatCurrency(item.unit_cost)}</Text>
                        <Text style={styles.colTotal}>{formatCurrency(item.subtotal)}</Text>
                    </View>
                ))}
            </View>

            {/* Totals Information */}
            <View style={styles.totalsContainer}>
                {/* Subtotal */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
                </View>

                {/* IVA */}
                {quote.iva_amount > 0 && (
                    <View style={[styles.totalRow, styles.totalRowGray]}>
                        <Text style={styles.totalLabel}>Impuestos trasladados (IVA)</Text>
                        <Text style={styles.totalValue}>{formatCurrency(quote.iva_amount)}</Text>
                    </View>
                )}

                {/* ISR (If applicable/existing in quote object) */}
                {quote.isr_amount > 0 && (
                    <View style={[styles.totalRow, styles.totalRowGray, { marginTop: 2 }]}>
                        <Text style={styles.totalLabel}>Impuestos retenidos (ISR)</Text>
                        <Text style={styles.totalValue}>{formatCurrency(quote.isr_amount)}</Text>
                    </View>
                )}

                {/* Total */}
                <View style={[styles.totalRow, { marginTop: 10 }]}>
                    <Text style={[styles.totalLabel, styles.totalFinal]}>Importe TOTAL</Text>
                    <Text style={[styles.totalValue, styles.totalFinal]}>{formatCurrency(quote.total)}</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>Desarrollando ideas, creando sueños.</Text>
            </View>
        </Page>
    </Document>
);
