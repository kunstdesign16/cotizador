"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

type Client = {
    id: string
    name: string
    company?: string | null
    email?: string | null
    phone?: string | null
}

interface ClientComboboxProps {
    clients: Client[]
    value?: string
    onSelect: (client: Client | null) => void
}

export function ClientCombobox({ clients, value, onSelect }: ClientComboboxProps) {
    // Fallback implementation using native select since cmdk installation failed
    return (
        <div className="relative">
            <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                value={value || ""}
                onChange={(e) => {
                    const selectedId = e.target.value
                    const client = clients.find(c => c.id === selectedId) || null
                    onSelect(client)
                }}
            >
                <option value="">Seleccionar Cliente...</option>
                {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                        {client.name} {client.company ? `(${client.company})` : ''}
                    </option>
                ))}
            </select>
            <ChevronsUpDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
    )
}
