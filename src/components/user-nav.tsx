"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
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
    LogOut,
    User,
    Shield,
    Phone
} from 'lucide-react'
import { logout } from "@/actions/auth"

interface UserNavProps {
    userName: string
    userRole: string
    userEmail: string
}

export function UserNav({ userName, userRole, userEmail }: UserNavProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-full justify-start gap-2 px-2 hover:bg-primary/10">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                        <p className="text-sm font-medium truncate w-full text-left">{userName || 'Usuario'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{userRole === 'admin' ? 'Administrador' : 'Staff'}</p>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userEmail}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {/*
                    {userRole === 'admin' && (
                        <DropdownMenuItem onClick={() => router.push('/admin/users')}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Gestión de Usuarios</span>
                        </DropdownMenuItem>
                    )}
                    */}
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Preferencias de usuario</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Contraseña y seguridad</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Phone className="mr-2 h-4 w-4" />
                        <span>Información de contacto</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => await logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
