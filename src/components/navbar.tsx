import Link from "next/link"
import { LayoutDashboard, Users, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                            <img src="/logo.svg" alt="Kunst & Design" className="h-24 w-auto" />
                        </Link>

                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Proyectos
                                </Button>
                            </Link>
                            <Link href="/clients">
                                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                                    <Users className="h-4 w-4" />
                                    Clientes
                                </Button>
                            </Link>
                            <Link href="/suppliers">
                                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                                    <Package className="h-4 w-4" />
                                    Proveedores
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            AD
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
