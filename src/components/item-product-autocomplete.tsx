
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { searchProducts } from "@/actions/products"
import { Loader2 } from "lucide-react"

type Product = {
    id: string
    code: string
    name: string
    price: number
    category: string | null
}

interface ItemProductAutocompleteProps {
    value: string
    onChange: (value: string) => void
    onSelect: (product: Product) => void
    placeholder?: string
}

export function ItemProductAutocomplete({ value, onChange, onSelect, placeholder }: ItemProductAutocompleteProps) {
    const [query, setQuery] = useState(value)
    const [results, setResults] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setQuery(value)
    }, [value])

    // Handle outside click to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSearch = async (text: string) => {
        setQuery(text)
        onChange(text)

        if (text.length < 2) {
            setResults([])
            setOpen(false)
            return
        }

        setLoading(true)
        setOpen(true)
        try {
            const products = await searchProducts(text)
            setResults(products)
        } catch (error) {
            console.error("Search error", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (product: Product) => {
        setQuery(product.name)
        onSelect(product)
        setOpen(false)
    }

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <Input
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={placeholder}
                    className="border-transparent shadow-none focus-visible:ring-0 bg-transparent px-2 w-full"
                    autoComplete="off"
                />
                {loading && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {open && results.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-1 w-[400px] rounded-md border bg-white dark:bg-slate-900 p-1 shadow-lg text-popover-foreground">
                    <div className="max-h-[300px] overflow-auto py-1">
                        {results.map((product) => (
                            <button
                                key={product.id}
                                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm flex justify-between items-center"
                                onClick={() => handleSelect(product)}
                            >
                                <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {product.category ? <span className="font-medium text-amber-600 mr-2">{product.category}</span> : null}
                                        {product.code}
                                    </div>
                                </div>
                                <div className="text-xs font-semibold text-primary">
                                    ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {open && query.length >= 2 && !loading && results.length === 0 && (
                <div className="absolute left-0 top-full z-50 mt-1 w-[200px] rounded-md border bg-white dark:bg-slate-900 p-2 shadow-lg text-muted-foreground text-xs">
                    No se encontraron productos.
                </div>
            )}
        </div>
    )
}
