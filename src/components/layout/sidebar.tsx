'use client'

import { useState, useEffect } from 'react'
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
    Package,
    BarChart,
    Menu,
    X,
    Calculator,
    Wallet,
    UserCog,
    LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/actions/auth'
import { UserNav } from '@/components/user-nav'
import { getCurrentUser } from '@/actions/users'

const navigation = [
    { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cotizaciones', href: '/quotes/new', icon: FileText, match: '/quotes' },
    { name: 'Proyectos', href: '/projects', icon: Package },
    { name: 'Tareas', href: '/tasks', icon: CheckSquare },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Proveedores', href: '/suppliers', icon: Truck },
    { name: 'Reportes', href: '/reports', icon: BarChart },
    { name: 'Configuración', href: '/settings', icon: Settings },
]

const adminNavigation = [
    { name: 'Contabilidad', href: '/accounting', icon: Calculator },
    { name: 'Usuarios', href: '/users', icon: UserCog },
]

export function Sidebar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [userRole, setUserRole] = useState<string>('staff')
    const [userName, setUserName] = useState<string>('')
    const [userEmail, setUserEmail] = useState<string>('')

    const ADMIN_EMAILS = [
        'kunstdesign16@gmail.com',
        'direccion@kunstdesign.com.mx',
        'dirección@kunstdesign.com.mx'
    ]

    useEffect(() => {
        const updateSession = (email: string, role: string, name: string) => {
            const emailLower = email.toLowerCase().trim()
            const isForcedAdmin = ADMIN_EMAILS.includes(emailLower)
            const finalRole = isForcedAdmin ? 'admin' : role

            setUserEmail(emailLower)
            setUserRole(finalRole)
            setUserName(name)

            // Cache in localStorage for aggressive persistence
            if (emailLower) {
                localStorage.setItem('cached_role', finalRole)
                localStorage.setItem('cached_email', emailLower)
            }
        }

        // 0. Try reading from localStorage first (Instant UI update)
        const cachedRole = localStorage.getItem('cached_role')
        const cachedEmail = localStorage.getItem('cached_email')
        if (cachedRole && cachedEmail) {
            setUserRole(cachedRole)
            setUserEmail(cachedEmail)
        }

        // 1. Try reading from cookies (fastest)
        const cookies = document.cookie.split(';')
        const roleCookie = cookies.find(c => c.trim().startsWith('user_role='))
        const nameCookie = cookies.find(c => c.trim().startsWith('user_name='))
        const emailCookie = cookies.find(c => c.trim().startsWith('user_email='))

        const cRole = roleCookie ? roleCookie.split('=')[1] : (cachedRole || 'staff')
        const cName = nameCookie ? decodeURIComponent(nameCookie.split('=')[1]) : 'Usuario'
        const cEmail = emailCookie ? decodeURIComponent(emailCookie.split('=')[1]) : (cachedEmail || '')

        if (cEmail) {
            updateSession(cEmail, cRole, cName)
        }

        // 2. Always verify with server to be sure (Source of truth)
        getCurrentUser().then(user => {
            if (user) {
                updateSession(user.email, user.role, user.name || 'Usuario')
            }
        })
    }, [])

    if (pathname === '/login') return null

    const isAdmin = userRole === 'admin'

    const NavContent = () => (
        <>
            <div className="flex h-24 items-center px-6 border-b">
                <Link href="/dashboard" className="flex items-center justify-center w-full">
                    <img src="/logo.svg" alt="Kunst Design" className="h-[80px] w-auto" />
                </Link>
            </div>
            <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
                {/* ... navigation ... */}
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">
                    Menu Principal
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
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                        <div className="text-xs font-semibold text-muted-foreground mt-4 mb-2 px-2 uppercase tracking-wider">
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
                    </>
                )}
            </nav>
            <div className="p-4 border-t space-y-3">
                <div className="px-2">
                    <UserNav userName={userName} userRole={userRole} userEmail={userEmail} />
                </div>

                {/* Temp Diagnostic Debug - Only for troubleshooting */}
                <div className="mx-2 p-2 rounded bg-slate-900 text-white text-[9px] font-mono leading-tight space-y-1 border border-amber-500">
                    <div className="text-amber-400 font-bold border-b border-amber-500/30 pb-1 mb-1">🔍 DIAGNÓSTICO DE SESIÓN</div>
                    <div className="flex justify-between">
                        <span>DETECCIÓN UI:</span>
                        <span className={isAdmin ? "text-green-400" : "text-amber-400"}>
                            {isAdmin ? "ADMIN" : "STAFF"}
                        </span>
                    </div>
                    <div className="text-slate-400">Email UI:</div>
                    <div className="truncate text-blue-300 bg-slate-800 p-0.5 rounded">{userEmail || "NO DETECTADO"}</div>

                    <div className="mt-1 border-t border-slate-700 pt-1 space-y-0.5">
                        <div className="flex justify-between">
                            <span>Cookie Email:</span>
                            <span className="text-blue-300">{(typeof document !== 'undefined' && document.cookie.includes('user_email')) ? 'OK' : 'FALTA'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Cookie Role:</span>
                            <span className="text-blue-300">{(typeof document !== 'undefined' && document.cookie.includes('user_role')) ? 'OK' : 'FALTA'}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-0.5 mt-0.5">
                            <span>L.Storage Cache:</span>
                            <span className="text-blue-300">{(typeof window !== 'undefined' && localStorage.getItem('cached_role')) ? 'OK' : 'FALTA'}</span>
                        </div>
                    </div>

                    <div className="mt-1 text-[8px] opacity-50 italic border-t border-slate-700 pt-1">
                        Ref: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">Cotizador v2.0</p>
                    <p>Sistema de Gestión</p>
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
