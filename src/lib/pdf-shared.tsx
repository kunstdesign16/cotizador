import { Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import path from 'path';

// Disable Hyphenation globally for institutional documents
Font.registerHyphenationCallback(word => [word]);

// Portable paths for branding assets - loaded from public dir but using process.cwd() for the PDF renderer
const SITIO_ROOT = '/Users/kunstdesign/Documents/Kunst Design/Sitios/cotizador_kunst/sitio';
const LOGO_PATH = `${SITIO_ROOT}/public/brand/logo.png`;
const WATERMARK_PATH = `${SITIO_ROOT}/public/brand/watermark.png`;

const IS_GENERIC = process.env.NEXT_PUBLIC_GENERIC_PDF === 'true';

export const sharedStyles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        paddingTop: '55mm', // Increased for header clearance (Extra 1cm as requested)
        paddingBottom: '35mm', // Space for the larger footer
        paddingLeft: '20mm',
        paddingRight: '20mm',
        fontSize: 10,
        color: '#545555',
    },
    // Watermark - Full Page Image KD Carta (as provided by user)
    watermarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -10, // Far back
        opacity: 0.1, // 10% opacity as requested
    },
    watermark: {
        width: '100%',
        height: '100%',
        objectFit: 'cover', // Cover full page as requested
    },
    draftWatermark: {
        position: 'absolute',
        fontSize: 110,
        color: '#94A3B8',
        opacity: 0.1, // Restore visibility
        transform: 'rotate(-45deg)',
        fontWeight: 'bold',
        width: 800,
        textAlign: 'center',
        top: '40%',
        left: '50%',
        marginLeft: -400,
        zIndex: 50
    },
    // Header
    headerContainer: {
        position: 'absolute',
        top: '12mm',
        left: '20mm',
        right: '20mm',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 10,
        zIndex: 100, // Ensure logo is on top
    },
    logo: {
        width: '58mm', // Match the width used in the successful Quote PDF
        height: 'auto',
    },
    headerInfo: {
        alignItems: 'flex-end',
        textAlign: 'right'
    },
    locationText: {
        fontSize: 10,
        color: '#545555',
        marginBottom: 6 // Increased to prevent overlap
    },
    dateText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#284960',
        lineHeight: 1.2
    },
    // Footer
    footerContainer: {
        position: 'absolute',
        bottom: '15mm',
        left: '20mm',
        right: '20mm',
        alignItems: 'center',
        zIndex: 100, // Ensure footer is on top
    },
    contactLine: {
        fontSize: 10, // Reduced 2pt (was 12)
        fontWeight: 'bold',
        color: '#284960',
        marginBottom: 8,
        textAlign: 'center',
        width: '100%',
    },
    footerDivider: {
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        marginBottom: 10
    },
    slogan: {
        fontSize: 12, // Reduced to prevent cutoff or wrapping
        fontWeight: 'normal',
        color: '#545555',
        textAlign: 'center',
        width: '100%',
        letterSpacing: 1,
        marginTop: 5,
    }
});

export const PDFWatermark = ({ isApproved = true }: { isApproved?: boolean }) => (
    <>
        <View style={sharedStyles.watermarkContainer} fixed>
            <Image src={WATERMARK_PATH} style={sharedStyles.watermark} />
        </View>
        {!isApproved && (
            <Text style={sharedStyles.draftWatermark} fixed>PRELIMINAR</Text>
        )}
    </>
);

export const PDFHeader = ({ date }: { date: string | Date }) => (
    <View style={sharedStyles.headerContainer} fixed>
        <Image src={LOGO_PATH} style={sharedStyles.logo} />
        <View style={sharedStyles.headerInfo}>
            <Text style={sharedStyles.locationText}>Tlajomulco de Zúñiga, Jalisco</Text>
            <Text style={sharedStyles.dateText}>
                {new Date(date).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </Text>
        </View>
    </View>
);

export const PDFFooter = () => (
    <View style={sharedStyles.footerContainer} fixed>
        {!IS_GENERIC ? (
            <>
                <Text style={sharedStyles.contactLine}>
                    mayelam@kunstdesign.com.mx  |  +52 33 51 18 11 22  |  @kunstanddesign
                </Text>
                <View style={sharedStyles.footerDivider} />
                <Text style={sharedStyles.slogan}>
                    Desarrollando ideas, creando sueños.
                </Text>
            </>
        ) : (
            <>
                <Text style={[sharedStyles.contactLine, { fontSize: 8 }]}>
                    Documento generado digitalmente por el sistema de gestión de proyectos.
                </Text>
                <View style={sharedStyles.footerDivider} />
                <Text style={[sharedStyles.slogan, { fontSize: 12 }]}>
                    Gestión Eficiente • Cotización Rápida • Control Total
                </Text>
            </>
        )}
    </View>
);
