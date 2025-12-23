// Basic mock for useToast to fix build errors
export function useToast() {
    return {
        toast: ({ title, description, variant }: { title?: string, description?: string, variant?: string }) => {
            console.log(`Toast: ${title} - ${description} [${variant}]`)
            if (typeof window !== 'undefined') {
                alert(`${title}\n${description}`)
            }
        }
    }
}
