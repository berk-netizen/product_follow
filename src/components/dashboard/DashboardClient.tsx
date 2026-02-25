"use client"

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ProductionItem } from "@/types";
import { getProductionItems, createProductionItem } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, TableProperties } from "lucide-react";
import KanbanBoard from "./KanbanBoard";
import { CreateProductDialog } from "./CreateProductDialog";
// import DataTable from "./DataTable";

export default function DashboardClient() {
    const t = useTranslations("Dashboard");
    const [items, setItems] = useState<ProductionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const data = await getProductionItems();
                setItems(data);
            } catch (error) {
                console.error("Failed to fetch production items", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const handleCreateProduct = async (newItemData: Partial<ProductionItem>) => {
        const newItem: Partial<ProductionItem> = {
            season: newItemData.season || 'N/A',
            model_code: newItemData.model_code || 'N/A',
            model_name: newItemData.model_name || 'New Item',
            category: 'Category',
            manufacturer: newItemData.manufacturer || 'N/A',
            status: 'SAMPLE SEWN',
            sizes_breakdown: {},
            target_loading_date: newItemData.target_loading_date || '',
            po_date: '',
            fabric_arrival_date: null,
            cutting_date: null,
            actual_mfg_deadline: null,
            image_url: null,
            fabric_supplier: 'N/A',
            fabric_quality: 'N/A',
            fabric_composition: 'N/A',
            lining_detail: 'N/A',
            color_name: 'N/A',
            color_code: 'N/A',
            fabric_order_status: 'PENDING',
            planned_qty: newItemData.planned_qty || 0,
            received_qty: 0,
            target_sales_price: 0,
            final_sales_price_tl: 0,
        }

        try {
            const createdItem = await createProductionItem(newItem);
            if (createdItem) {
                setItems(prev => [createdItem, ...prev]);
            }
        } catch (error) {
            console.error("Failed to create product", error);
        }
    };

    const totalPlannedQty = items.reduce((sum, item) => sum + item.planned_qty, 0);

    // Calculate average profit margin mock calculation 
    // Formula: ((Target Price - (Mock Cost)) / Target Price) * 100
    // Since we only load products here, we mock the overall margin directly, or estimate
    const avgProfitMargin = 22.5;

    if (loading) {
        return <div className="h-64 flex items-center justify-center text-slate-500">Loading production data...</div>;
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Header sections */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage and track your overall production phases.</p>
                </div>

                <div className="flex items-center gap-4">
                    <CreateProductDialog onAdd={handleCreateProduct} />

                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <Button
                            variant={viewMode === "kanban" ? "default" : "ghost"}
                            size="sm"
                            className={`gap-2 ${viewMode === "kanban" ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-600'}`}
                            onClick={() => setViewMode("kanban")}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            {t("kanban_view")}
                        </Button>
                        <Button
                            variant={viewMode === "table" ? "default" : "ghost"}
                            size="sm"
                            className={`gap-2 ${viewMode === "table" ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-600'}`}
                            onClick={() => setViewMode("table")}
                        >
                            <TableProperties className="h-4 w-4" />
                            {t("table_view")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-white text-slate-900 shadow-sm p-6 flex flex-col gap-2">
                    <h3 className="tracking-tight text-sm font-medium text-slate-500 uppercase">{t("total_planned_qty")}</h3>
                    <div className="text-3xl font-bold font-sans">{totalPlannedQty.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border bg-white text-slate-900 shadow-sm p-6 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 opacity-50 pointer-events-none"></div>
                    <h3 className="tracking-tight text-sm font-medium text-slate-500 uppercase">{t("avg_profit_margin")}</h3>
                    <div className="text-3xl font-bold font-sans text-emerald-600">{avgProfitMargin.toFixed(1)}%</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="mt-2 min-h-[600px] border rounded-xl bg-slate-100/50 p-4">
                {items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500">
                        {t("no_items")}
                    </div>
                ) : viewMode === "kanban" ? (
                    <KanbanBoard initialItems={items} />
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                        (Table View placeholder)
                    </div>
                )}
            </div>
        </div>
    );
}
