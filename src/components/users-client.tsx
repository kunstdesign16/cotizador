"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Pencil, X, Users, Shield, User } from 'lucide-react'
import { createUser, updateUser, deleteUser } from '@/actions/users'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface UserData {
    id: string
    email: string
    name: string | null
    role: string
    createdAt: string
}

interface UsersClientProps {
    initialUsers: UserData[]
}

const ROLES = [
    { value: 'admin', label: 'Administrador', icon: Shield, color: 'text-primary' },
    { value: 'staff', label: 'Colaborador', icon: User, color: 'text-muted-foreground' }
]

export function UsersClient({ initialUsers }: UsersClientProps) {
    const [users, setUsers] = useState(initialUsers)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'staff'
    })

    const resetForm = () => {
        setFormData({ email: '', password: '', name: '', role: 'staff' })
        setEditingId(null)
        setShowForm(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (editingId) {
                const updateData: any = {
                    name: formData.name || undefined,
                    role: formData.role
                }
                if (formData.password) {
                    updateData.password = formData.password
                }
                const result = await updateUser(editingId, updateData)
                if (result.success) {
                    router.refresh()
                    resetForm()
                } else {
                    alert(result.error)
                }
            } else {
                if (!formData.password) {
                    alert('La contraseña es requerida')
                    setLoading(false)
                    return
                }
                const result = await createUser({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name || undefined,
                    role: formData.role
                })
                if (result.success) {
                    router.refresh()
                    resetForm()
                } else {
                    alert(result.error)
                }
            }
        } catch {
            alert('Error al guardar')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (user: UserData) => {
        setFormData({
            email: user.email,
            password: '',
            name: user.name || '',
            role: user.role
        })
        setEditingId(user.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return

        const result = await deleteUser(id)
        if (result.success) {
            setUsers(users.filter(u => u.id !== id))
            router.refresh()
        } else {
            alert(result.error)
        }
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8">
            <div className="mx-auto max-w-4xl space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Users className="h-7 w-7 text-primary" />
                            Usuarios
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base">Administra los usuarios del sistema</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Nuevo Usuario</span>
                    </Button>
                </header>

                {/* Users Table */}
                {/* Users List - Responsive */}
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted border-b">
                                <tr>
                                    <th className="py-3 px-4 text-left font-medium whitespace-nowrap">Usuario</th>
                                    <th className="py-3 px-4 text-left font-medium whitespace-nowrap">Email</th>
                                    <th className="py-3 px-4 text-left font-medium whitespace-nowrap">Rol</th>
                                    <th className="py-3 px-4 text-left font-medium whitespace-nowrap">Creado</th>
                                    <th className="py-3 px-4 text-center font-medium whitespace-nowrap">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                            No hay usuarios registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => {
                                        const roleInfo = ROLES.find(r => r.value === user.role) || ROLES[1]
                                        const RoleIcon = roleInfo.icon

                                        return (
                                            <tr key={user.id} className="hover:bg-muted/50">
                                                <td className="py-3 px-4 font-medium">
                                                    {user.name || '-'}
                                                </td>
                                                <td className="py-3 px-4">{user.email}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`flex items-center gap-1 ${roleInfo.color}`}>
                                                        <RoleIcon className="h-4 w-4" />
                                                        {roleInfo.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground">
                                                    {format(new Date(user.createdAt), 'd MMM yyyy', { locale: es })}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex justify-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleEdit(user)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                            onClick={() => handleDelete(user.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y">
                        {users.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No hay usuarios registrados.
                            </div>
                        ) : (
                            users.map((user) => {
                                const roleInfo = ROLES.find(r => r.value === user.role) || ROLES[1]
                                const RoleIcon = roleInfo.icon

                                return (
                                    <div key={user.id} className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-base">{user.name || 'Sin Nombre'}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={`flex items-center gap-1 font-medium ${roleInfo.color}`}>
                                                <RoleIcon className="h-4 w-4" />
                                                {roleInfo.label}
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                {format(new Date(user.createdAt), 'd MMM yyyy', { locale: es })}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Role Info */}
                <div className="bg-muted/50 rounded-xl p-4 text-sm">
                    <h3 className="font-semibold mb-2">Permisos por Rol</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="font-medium flex items-center gap-1 text-primary">
                                <Shield className="h-4 w-4" /> Administrador
                            </p>
                            <p className="text-muted-foreground text-xs mt-1">
                                Acceso completo: Contabilidad, Gastos Fijos, Gestión de Usuarios
                            </p>
                        </div>
                        <div>
                            <p className="font-medium flex items-center gap-1">
                                <User className="h-4 w-4" /> Colaborador
                            </p>
                            <p className="text-muted-foreground text-xs mt-1">
                                Clientes, Proveedores, Tareas, Ordenes de Compra, Cotizaciones
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-background rounded-xl border shadow-lg p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">
                                    {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h2>
                                <Button variant="ghost" size="icon" onClick={resetForm}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium block mb-1">Nombre</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Nombre completo"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium block mb-1">Email *</label>
                                    <Input
                                        type="email"
                                        required
                                        disabled={!!editingId}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="usuario@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium block mb-1">
                                        {editingId ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña *'}
                                    </label>
                                    <Input
                                        type="password"
                                        required={!editingId}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium block mb-1">Rol</label>
                                    <div className="relative">
                                        <select
                                            className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            {ROLES.map(role => (
                                                <option key={role.value} value={role.value}>{role.label}</option>
                                            ))}
                                        </select>
                                        <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={resetForm}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
