import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserAdminControls } from "@/components/user-admin-controls"

export default async function AdminUsersPage() {
    const { prisma } = await import('@/lib/prisma')
    const cookieStore = await cookies()
    const role = cookieStore.get('user_role')?.value

    if (role !== 'admin') {
        redirect('/dashboard')
    }

    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground">Administra el acceso y roles del sistema.</p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Estatus</TableHead>
                            <TableHead>Creado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <UserAdminControls
                                        userId={user.id}
                                        initialRole={user.role}
                                        initialStatus={user.isActive}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.isActive ? "default" : "secondary"}>
                                        {user.isActive ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {new Date(user.createdAt).toLocaleDateString('es-MX')}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
