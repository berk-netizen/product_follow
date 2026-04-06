"use client"

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ProductionItem } from "@/types";
import { getProductionItems, createProductionItem } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, TableProperties, Package, TrendingUp, Download, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import KanbanBoard from "./KanbanBoard";
import { CreateProductDialog } from "./CreateProductDialog";
import { Badge } from "@/components/ui/badge";

export default function DashboardClient() {
    const t = useTranslations("Dashboard");
    const [items, setItems] = useState<ProductionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const data = await getProductionItems();
                // Main dashboard only shows production items (is_sample: false or null/undefined)
                setItems(data.filter(item => item.is_sample !== true));
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
            target_loading_date: newItemData.target_loading_date || null,
            po_date: null,
            fabric_arrival_date: null,
            cutting_date: null,
            actual_mfg_deadline: null,
            image_url: null,
            main_image_url: newItemData.main_image_url || null,
            fabric_supplier: null,
            fabric_quality: null,
            fabric_composition: null,
            lining_detail: null,
            color_name: null,
            color_code: null,
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
            } else {
                console.error("Failed to create: Supabase returned no data.");
                alert("Failed to add product. Please check console.");
            }
        } catch (error) {
            console.error("Failed to create product", error);
            alert("Failed to add product.");
        }
    };

    const handleExportExcel = () => {
        if (items.length === 0) {
            alert("No data found to export.");
            return;
        }
        
        const exportData = items.map(item => ({
            "ID": item.id,
            "Sezon": item.season,
            "Model Kodu": item.model_code,
            "Model Adı": item.model_name,
            "Kategori": item.category,
            "Üretici": item.manufacturer,
            "Durum": item.status,
            "Planlanan Adet": item.planned_qty,
            "Hedef Satış Fiyatı": item.target_sales_price,
            "Kumaş Durumu": item.fabric_order_status
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, "Product_Follow_Export.xlsx");
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                let importedCount = 0;
                for (const row of jsonData) {
                    const newItem: Partial<ProductionItem> = {
                        season: row["Sezon"] || "N/A",
                        model_code: row["Model Kodu"] || "N/A",
                        model_name: row["Model Adı"] || "Imported Item",
                        category: row["Kategori"] || "Category",
                        manufacturer: row["Üretici"] || "N/A",
                        status: row["Durum"] || "SAMPLE SEWN",
                        planned_qty: Number(row["Planlanan Adet"]) || 0,
                        target_sales_price: Number(row["Hedef Satış Fiyatı"]) || 0,
                        fabric_order_status: row["Kumaş Durumu"] || "PENDING",
                    };
                    const created = await createProductionItem(newItem);
                    if (created) {
                        setItems(prev => [created, ...prev]);
                        importedCount++;
                    }
                }
                alert(`${importedCount} products successfully imported.`);
            } catch (error) {
                console.error("Excel import error", error);
                alert("Error reading Excel file.");
            }
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsArrayBuffer(file);
    };

    const totalPlannedQty = items.reduce((sum, item) => sum + item.planned_qty, 0);
    const avgProfitMargin = 22.5;

    if (loading) {
        return <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse font-medium">Loading production data...</div>;
    }

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground font-playfair">{t("title")}</h2>
                    <p className="text-muted-foreground text-sm mt-1 max-w-md">Manage and track your overall production phases with real-time analytics.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImportExcel} 
                        accept=".xlsx, .xls" 
                        className="hidden" 
                    />
                    
                    <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border mr-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => fileInputRef.current?.click()}
                            className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-all"
                        >
                            <Upload className="w-3.5 h-3.5 mr-2" />
                            Import
                        </Button>
                        <div className="w-[1px] h-4 bg-border mx-1" />
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleExportExcel}
                            className="h-8 text-xs text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5 rounded-lg transition-all"
                        >
                            <Download className="w-3.5 h-3.5 mr-2" />
                            Export
                        </Button>
                    </div>

                    <CreateProductDialog onAdd={handleCreateProduct} />

                    <div className="flex bg-muted/50 p-1 rounded-xl border border-border ml-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-lg gap-2 text-xs transition-all ${viewMode === "kanban" ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setViewMode("kanban")}
                        >
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            {t("kanban_view")}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 rounded-lg gap-2 text-xs transition-all ${viewMode === "table" ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setViewMode("table")}
                        >
                            <TableProperties className="h-3.5 w-3.5" />
                            {t("table_view")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <Package className="w-20 h-20 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="tracking-tight text-xs font-semibold text-muted-foreground uppercase opacity-70 mb-1">{t("total_planned_qty")}</h3>
                        <div className="text-4xl font-bold tracking-tight text-foreground">{totalPlannedQty.toLocaleString()}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Live data from all phases
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <TrendingUp className="w-20 h-20 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="tracking-tight text-xs font-semibold text-muted-foreground uppercase opacity-70 mb-1">{t("avg_profit_margin")}</h3>
                        <div className="text-4xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{avgProfitMargin.toFixed(1)}%</div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Target vs Actual estimation
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="mt-4 rounded-2xl overflow-hidden min-h-[600px]">
                {items.length === 0 ? (
                    <div className="h-[600px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 border border-dashed border-border rounded-2xl">
                        <Package className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium">{t("no_items")}</p>
                        <p className="text-xs opacity-60 mt-1">Start by adding a new product or importing from Excel.</p>
                    </div>
                ) : viewMode === "kanban" ? (
                    <KanbanBoard initialItems={items} />
                ) : (
                    <div className="h-[600px] flex items-center justify-center text-muted-foreground bg-card border border-border rounded-2xl shadow-sm">
                        <div className="flex flex-col items-center gap-2">
                            <TableProperties className="w-8 h-8 opacity-20" />
                            <p className="text-sm font-medium">Table View Coming Soon</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
