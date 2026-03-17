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
            target_loading_date: newItemData.target_loading_date || null,
            po_date: null,
            fabric_arrival_date: null,
            cutting_date: null,
            actual_mfg_deadline: null,
            image_url: null,
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
                alert("Ürün eklenemedi. Konsola bakın.");
            }
        } catch (error) {
            console.error("Failed to create product", error);
            alert("Ürün eklenemedi.");
        }
    };

    const handleExportExcel = () => {
        if (items.length === 0) {
            alert("Dışa aktarılacak veri bulunamadı.");
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
            "Tedarikçi Tipi": item.supplier_type || '',
            "Teslimat Tarihi": item.delivery_date || '',
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
                        supplier_type: row["Tedarikçi Tipi"] || null,
                        delivery_date: row["Teslimat Tarihi"] || null,
                        fabric_order_status: row["Kumaş Durumu"] || "PENDING",
                    };
                    const created = await createProductionItem(newItem);
                    if (created) {
                        setItems(prev => [created, ...prev]);
                        importedCount++;
                    }
                }
                alert(`${importedCount} ürün başarıyla içe aktarıldı.`);
            } catch (error) {
                console.error("Excel import error", error);
                alert("Excel dosyası okunurken hata oluştu.");
            }
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsArrayBuffer(file);
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
                    <h2 className="text-3xl font-bold tracking-tight text-white font-playfair">{t("title")}</h2>
                    <p className="text-slate-400 text-sm mt-1">Manage and track your overall production phases.</p>
                </div>

                <div className="flex items-center gap-4">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImportExcel} 
                        accept=".xlsx, .xls" 
                        className="hidden" 
                    />
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-800/50 text-white border-white/10 hover:bg-slate-700/50 hover:text-white"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleExportExcel}
                        className="bg-emerald-500/10 text-emerald-400 border-white/10 hover:bg-emerald-500/20 hover:text-emerald-300"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>

                    <CreateProductDialog onAdd={handleCreateProduct} />

                    <div className="flex bg-slate-800/50 backdrop-blur-md p-1 rounded-lg border border-white/5">
                        <Button
                            variant={viewMode === "kanban" ? "default" : "ghost"}
                            size="sm"
                            className={`gap-2 ${viewMode === "kanban" ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setViewMode("kanban")}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            {t("kanban_view")}
                        </Button>
                        <Button
                            variant={viewMode === "table" ? "default" : "ghost"}
                            size="sm"
                            className={`gap-2 ${viewMode === "table" ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600' : 'text-slate-400 hover:text-white'}`}
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
                <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-md text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package className="w-16 h-16 text-emerald-500" />
                    </div>
                    <h3 className="tracking-tight text-xs font-semibold text-slate-400 uppercase">{t("total_planned_qty")}</h3>
                    <div className="text-3xl font-bold tracking-tight">{totalPlannedQty.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-md text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-16 h-16 text-emerald-500" />
                    </div>
                    <h3 className="tracking-tight text-xs font-semibold text-slate-400 uppercase">{t("avg_profit_margin")}</h3>
                    <div className="text-3xl font-bold tracking-tight text-emerald-400">{avgProfitMargin.toFixed(1)}%</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="mt-2 min-h-[600px] rounded-xl bg-transparent">
                {items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 bg-slate-800/30 backdrop-blur-md border border-white/10 rounded-xl min-h-[600px]">
                        {t("no_items")}
                    </div>
                ) : viewMode === "kanban" ? (
                    <KanbanBoard initialItems={items} />
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 bg-slate-800/30 backdrop-blur-md border border-white/10 rounded-xl min-h-[600px]">
                        (Table View placeholder)
                    </div>
                )}
            </div>
        </div>
    );
}
