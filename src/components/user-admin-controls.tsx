"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { updateUserRole, toggleUserStatus } from "@/actions/admin-users"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UserAdminControlsProps {
    userId: string
    initialRole: string
    initialStatus: boolean
}

export function UserAdminControls({ userId, initialRole, initialStatus }: UserAdminControlsProps) {
    const router = useRouter()

    // We can use state for optimistic updates or just rely on router refresh
    const handleRoleChange = async (newRole: string) => {
        try {
            const res = await updateUserRole(userId, newRole)
            if (res.success) {
                toast.success("Rol actualizado")
                router.refresh()
            } else {
                toast.error(res.error || "Error al actualizar rol")
            }
        } catch (error) {
            toast.error("Error inesperado")
        }
    }

    const handleStatusChange = async (checked: boolean) => {
        try {
            const res = await toggleUserStatus(userId, initialStatus)
            if (res.success) {
                toast.success(checked ? "Usuario activado" : "Usuario desactivado")
                router.refresh()
            } else {
                toast.error(res.error || "Error al cambiar estatus")
            }
        } catch (error) {
            toast.error("Error inesperado")
        }
    }

    return (
        <div className="flex items-center gap-4">
            <div className="w-[140px]">
                <Select defaultValue={initialRole} onValueChange={handleRoleChange}>
                    <SelectTrigger className="h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        {/* Add other roles if they exist in schema, else constrain to these */}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2">
                <Switch
                    checked={initialStatus}
                    onCheckedChange={handleStatusChange}
                />
            </div>
        </div>
    )
}
