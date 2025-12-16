'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    FileText,
    Users,
    Truck,
    CheckSquare,
    Settings,
    Package
} from 'lucide-react'

const navigation = [
    { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cotizaciones', href: '/quotes/new', icon: FileText, match: '/quotes' },
    { name: 'Tareas', href: '/tasks', icon: CheckSquare },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Proveedores', href: '/suppliers', icon: Truck },
    // { name: 'Configuración', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    if (pathname === '/login') return null

    return (
        <div className="flex h-full flex-col bg-card border-r w-64 fixed left-0 top-0 bottom-0 z-40">
            <div className="flex h-16 items-center px-6 border-b">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                    <span className="text-primary">KUNST</span>
                    <span className="text-foreground">DESIGN</span>
                </Link>
            </div>
            <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">
                    Menu Principal
                </div>
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.match && pathname.startsWith(item.match))
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t">
                <div className="bg-muted/30 rounded-lg p-4 text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">Cotizador v2.0</p>
                    <p>Sistema de Gestión</p>
                </div>
            </div>
        </div>
    )
}
