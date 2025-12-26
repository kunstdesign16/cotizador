import Link from "next/link"
import Image from "next/image"
import { LayoutDashboard, Users, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-24 items-center justify-between">
                    {/* Left: Navigation Links */}
                    <div className="flex items-center gap-6">
                        <Link href="/clients">
                            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                                <Users className="h-5 w-5" />
                                <span className="text-base font-medium">Clientes</span>
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                                <LayoutDashboard className="h-5 w-5" />
                                <span className="text-base font-medium">Proyectos</span>
                            </Button>
                        </Link>
                        <Link href="/suppliers">
                            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                                <Package className="h-5 w-5" />
                                <span className="text-base font-medium">Proveedores</span>
                            </Button>
                        </Link>
                    </div>

                    {/* Right: Logo & User */}
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="flex items-center transition-opacity hover:opacity-80">
                            <Image src="/logo.svg" alt="Kunst & Design" width={128} height={128} className="h-32 w-auto object-contain" />
                        </Link>

                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium border border-border">
                            AD
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
