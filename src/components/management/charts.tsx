'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ManagementChartsProps {
    data: any[]
}

export function ManagementCharts({ data }: ManagementChartsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-xl border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Ingresos vs Egresos</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                            <Tooltip
                                formatter={(value: any) => [`$${(Number(value) || 0).toLocaleString()}`, '']}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} name="Ingresos" />
                            <Bar dataKey="egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Egresos" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="rounded-xl border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Utilidad Mensual</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                            <Tooltip
                                formatter={(value: any) => [`$${(Number(value) || 0).toLocaleString()}`, 'Utilidad']}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="utilidad"
                                stroke="#6366f1"
                                strokeWidth={3}
                                dot={{ fill: '#6366f1', r: 4 }}
                                name="Utilidad"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
