
/**
 * Utility to handle file downloading and sharing.
 * Uses Web Share API if available and falling back to traditional download.
 */
export async function downloadOrShareFile(blob: Blob, fileName: string, title?: string) {
    if (typeof window === 'undefined') return;

    // Check for Web Share API support
    const canShare = !!navigator.share && !!navigator.canShare;

    // Create a File object if sharing is supported
    const file = new File([blob], fileName, { type: blob.type });

    if (canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: title || fileName,
                text: title || fileName,
            });
            return;
        } catch (error) {
            // If sharing fails (e.g. user cancelled), fall back to download
            if ((error as Error).name !== 'AbortError') {
                console.error('Error sharing:', error);
            } else {
                return; // User cancelled
            }
        }
    }

    // Fallback: Traditional download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    // For iOS Safari, we might need some extra handling if this fails
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}
