"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { updateUserProfile, changeUserPassword } from "@/actions/user-settings"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UserProfileFormProps {
    user: {
        name: string
        email: string
        role: string
    }
}

export function UserProfileForm({ user }: UserProfileFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [securityLoading, setSecurityLoading] = useState(false)

    // Profile State
    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState(user.email)

    // Password State
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await updateUserProfile({ name, email })
            if (res.success) {
                toast.success("Perfil actualizado correctamente")
                router.refresh()
            } else {
                toast.error(res.error || "Error al actualizar")
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado")
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas no coinciden")
            return
        }
        if (newPassword.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres")
            return
        }

        setSecurityLoading(true)
        try {
            const res = await changeUserPassword({ current: currentPassword, new: newPassword })
            if (res.success) {
                toast.success("Contraseña actualizada")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                toast.error(res.error || "Error al cambiar contraseña")
            }
        } catch (error) {
            toast.error("Ocurrió un error")
        } finally {
            setSecurityLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>
                        Actualiza tu información básica de contacto.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rol (Solo lectura)</Label>
                            <Input
                                value={user.role === 'admin' ? 'Administrador' : 'Staff'}
                                disabled
                                className="bg-muted text-muted-foreground"
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Seguridad</CardTitle>
                    <CardDescription>
                        Cambia tu contraseña.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current">Contraseña Actual</Label>
                            <Input
                                id="current"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new">Nueva Contraseña</Label>
                                <Input
                                    id="new"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirmar Contraseña</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" variant="outline" disabled={securityLoading}>
                            {securityLoading ? "Actualizando..." : "Actualizar Contraseña"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
