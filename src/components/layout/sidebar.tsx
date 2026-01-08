'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    FileText,
    Users,
    Truck,
    Package,
    BarChart,
    Menu,
    X,
    Calculator,
    UserCog,
    Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserNav } from '@/components/user-nav'

const navigation = [
    { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Proyectos', href: '/projects', icon: Package },
    { name: 'Cotizaciones', href: '/quotes/new', icon: FileText, match: '/quotes' },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Proveedores', href: '/suppliers', icon: Truck },
]

const adminNavigation = [
    { name: 'Direccion', href: '/management', icon: BarChart },
    { name: 'Reportes', href: '/reports', icon: FileText },
    { name: 'Contabilidad', href: '/accounting', icon: Calculator },
    { name: 'Usuarios', href: '/users', icon: UserCog },
    { name: 'Configuración', href: '/settings', icon: Settings },
]

interface SidebarProps {
    initialUser: any
}

export function Sidebar({ initialUser }: SidebarProps) {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    // Use initialUser from server, fallback to empty defaults if none
    const userName = initialUser?.name || 'Usuario'
    const userRole = initialUser?.role || 'staff'
    const userEmail = initialUser?.email || ''
    const isAdmin = userRole === 'admin'

    if (pathname === '/login') return null

    const NavContent = () => (
        <>
            <div className="flex h-24 items-center px-6 border-b">
                <Link href="/dashboard" className="flex items-center justify-center w-full">
                    <Image src="/logo.svg" alt="Kunst Design" width={200} height={80} className="h-[80px] w-auto" />
                </Link>
            </div>
            <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
                <div className="text-xs font-brand-header text-primary/60 mb-3 px-2 uppercase tracking-widest border-b border-secondary pb-1">
                    Menú Principal
                </div>
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.match && pathname.startsWith(item.match))
                    const Icon = item.icon
                    const isSuppliers = item.name === 'Proveedores'

                    return (
                        <div key={item.name}>
                            <Link
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                                    isActive
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "text-primary/70 hover:bg-secondary/40 hover:text-primary"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                            {isSuppliers && (
                                <div className="ml-9 mt-1 space-y-1">
                                    <Link
                                        href="/supplier-orders"
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            "block px-3 py-2 text-xs font-medium rounded-md transition-colors",
                                            pathname.startsWith('/supplier-orders')
                                                ? "text-primary bg-primary/5"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                    >
                                        Ordenes de Compra
                                    </Link>
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Admin Section */}
                {isAdmin && (
                    <>
                        <div className="text-xs font-brand-header text-primary/60 mt-6 mb-3 px-2 uppercase tracking-widest border-b border-secondary pb-1">
                            Administración
                        </div>
                        {adminNavigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href)
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                                        isActive
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "text-primary/70 hover:bg-secondary/40 hover:text-primary"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </>
                )}
            </nav>
            <div className="p-4 border-t border-secondary space-y-3 bg-secondary/10">
                <div className="px-2">
                    <UserNav userName={userName} userRole={userRole} userEmail={userEmail} />
                </div>
                <div className="bg-white/50 rounded-lg p-4 text-[10px] text-primary/70 border border-secondary/50">
                    <p className="font-brand-header text-xs tracking-wider mb-1">PROYECTOS v2.5</p>
                    <p className="font-medium">Kunst & Design ®</p>
                </div>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="bg-background shadow-md"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={cn(
                "lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-300",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-full flex-col">
                    <NavContent />
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex h-full flex-col bg-card border-r w-64 fixed left-0 top-0 bottom-0 z-40">
                <NavContent />
            </div>
        </>
    )
}
