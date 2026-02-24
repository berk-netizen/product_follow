"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { ProductionItem } from "@/types"
import { getProductionItems } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import { DollarSign, Package, TrendingUp, BarChart3 } from "lucide-react"

export default function AnalyticsClient() {
    const t = useTranslations("Dashboard")
    const tNav = useTranslations("Navigation")
    const [items, setItems] = useState<ProductionItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchItems = async () => {
            const data = await getProductionItems()
            setItems(data)
            setLoading(false)
        }
        fetchItems()
    }, [])

    // Analytics Calculations
    const totalPlannedQty = items.reduce((sum, item) => sum + item.planned_qty, 0)

    // Mock Season Cost logic based on roughly $40 unit cost average
    const totalSeasonCost = items.reduce((sum, item) => sum + (item.planned_qty * 38.5), 0)
    const totalExpectedRevenue = items.reduce((sum, item) => sum + (item.planned_qty * item.target_sales_price), 0)
    const avgProfitMargin = totalExpectedRevenue > 0
        ? ((totalExpectedRevenue - totalSeasonCost) / totalExpectedRevenue) * 100
        : 0

    // Chart 1 Data: Status Distribution
    const statusData = [
        { name: 'Cutting', value: items.filter(i => i.status === 'IN CUTTING').length },
        { name: 'Sewing', value: items.filter(i => i.status === 'IN SEWING').length },
        { name: 'Warehouse', value: items.filter(i => i.status === 'IN WAREHOUSE' || i.status === 'SHIPPED').length },
        { name: 'Sample/Other', value: items.filter(i => !['IN CUTTING', 'IN SEWING', 'IN WAREHOUSE', 'SHIPPED'].includes(i.status)).length },
    ]

    // Chart 2 Data: Cost Breakdown Mock
    const costBreakdownData = [
        { name: 'Fabric', value: 65 },
        { name: 'Labor', value: 25 },
        { name: 'Trims', value: 10 },
    ]
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1']

    if (loading) return <div className="h-64 flex items-center justify-center text-slate-500">Loading Analytics...</div>

    return (
        <div className="flex flex-col gap-8 pb-20">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{tNav("analytics")} Overview</h2>
                <p className="text-slate-500 text-sm mt-1">High-level season performance and profitability tracking.</p>
            </div>

            {/* KPI Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Season Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">${totalSeasonCost.toLocaleString()}</div>
                        <p className="text-[10px] text-slate-400 mt-1 italic">* Estimated across all models</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">${totalExpectedRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. Profit Margin</CardTitle>
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{avgProfitMargin.toFixed(1)}%</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Units</CardTitle>
                        <Package className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{totalPlannedQty.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Production Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Cost Composition (%)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={costBreakdownData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {costBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-base font-semibold">Model Profitability Table</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
                            <tr>
                                <th className="p-4 pl-6">Model</th>
                                <th className="p-4 text-right">Target Price</th>
                                <th className="p-4 text-right">Est. Unit Cost</th>
                                <th className="p-4 text-right pr-6">Profit Margin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {items.map((item) => {
                                const mockCost = 35 + (Math.random() * 10);
                                const margin = ((item.target_sales_price - mockCost) / item.target_sales_price) * 100;
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="font-semibold text-slate-900">{item.model_name}</div>
                                            <div className="text-[10px] uppercase text-slate-400 font-mono mt-0.5">{item.model_code}</div>
                                        </td>
                                        <td className="p-4 text-right font-mono text-slate-600">${item.target_sales_price.toFixed(2)}</td>
                                        <td className="p-4 text-right font-mono text-slate-600">${mockCost.toFixed(2)}</td>
                                        <td className="p-4 text-right pr-6">
                                            <span className={`font-bold font-mono ${margin > 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {margin.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
