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
            <Card className="rounded-2xl border border-secondary shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-brand-header text-primary tracking-wide">Ingresos vs Egresos</CardTitle>
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
                            <Bar dataKey="ingresos" fill="#284960" radius={[6, 6, 0, 0]} name="Ingresos" />
                            <Bar dataKey="egresos" fill="#D2D2D2" radius={[6, 6, 0, 0]} name="Egresos" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border border-secondary shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-brand-header text-primary tracking-wide">Utilidad Mensual</CardTitle>
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
                                stroke="#284960"
                                strokeWidth={4}
                                dot={{ fill: '#284960', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                                name="Utilidad"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
