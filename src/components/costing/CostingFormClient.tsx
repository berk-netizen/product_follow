"use client"

import Image from "next/image"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { ProductionItem, ProductMaterial, ProductLaborCost, Status } from "@/types"
import { updateProductionItem, updateProductMaterials, updateProductLaborCosts } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Save, ArrowLeft, Package, UserSquare2, TrendingUp, Clock, Image as ImageIcon, Upload, X, Tag, Plus } from "lucide-react"
import { getDeadlineBadge } from "@/lib/dateUtils"
import { Label } from "@/components/ui/label"

interface CostingFormClientProps {
    initialProduct: ProductionItem;
    initialMaterials: ProductMaterial[];
    initialLaborCosts: ProductLaborCost[];
}

const STATUS_OPTIONS: Status[] = [
    'SAMPLE SEWN',
    'WAITING FABRIC',
    'IN CUTTING',
    'IN SEWING',
    'IRON/PACK',
    'IN WAREHOUSE',
    'SHIPPED'
];

export default function CostingFormClient({
    initialProduct,
    initialMaterials,
    initialLaborCosts
}: CostingFormClientProps) {
    const t = useTranslations("Costing")
    const tStatus = useTranslations("Status")
    const router = useRouter()

    const [product, setProduct] = useState<ProductionItem>(initialProduct)
    const [materials, setMaterials] = useState<ProductMaterial[]>(initialMaterials)
    const [laborCosts, setLaborCosts] = useState<ProductLaborCost[]>(initialLaborCosts)

    // Tracking sections
    const [targetLoadingDate, setTargetLoadingDate] = useState(initialProduct.target_loading_date || "")
    const [poDate, setPoDate] = useState(initialProduct.po_date || "")
    const [fabricArrivalDate, setFabricArrivalDate] = useState(initialProduct.fabric_arrival_date || "")
    const [cuttingDate, setCuttingDate] = useState(initialProduct.cutting_date || "")
    const [mfgDeadline, setMfgDeadline] = useState(initialProduct.actual_mfg_deadline || "")
    const [receivedQty, setReceivedQty] = useState(initialProduct.received_qty.toString())

    // Phase 3 States
    const [imagePreview, setImagePreview] = useState<string | null>(initialProduct.image_url)
    const [specs, setSpecs] = useState({
        fabric_supplier: initialProduct.fabric_supplier || "",
        fabric_quality: initialProduct.fabric_quality || "",
        fabric_composition: initialProduct.fabric_composition || "",
        lining_detail: initialProduct.lining_detail || "",
        color_name: initialProduct.color_name || "",
        color_code: initialProduct.color_code || "",
        fabric_order_status: initialProduct.fabric_order_status || "PENDING"
    })

    const deadlineBadge = getDeadlineBadge(targetLoadingDate, product.status)

    // Handlers
    const handleStatusChange = (status: string) => {
        setProduct(prev => ({ ...prev, status: status as Status }))
    }

    const handleSave = async () => {
        try {
            const updates: Partial<ProductionItem> = {
                status: product.status,
                target_loading_date: targetLoadingDate,
                po_date: poDate,
                fabric_arrival_date: fabricArrivalDate,
                cutting_date: cuttingDate,
                actual_mfg_deadline: mfgDeadline,
                received_qty: parseInt(receivedQty) || 0,
                image_url: imagePreview,
                fabric_supplier: specs.fabric_supplier,
                fabric_quality: specs.fabric_quality,
                fabric_composition: specs.fabric_composition,
                lining_detail: specs.lining_detail,
                color_name: specs.color_name,
                color_code: specs.color_code,
                fabric_order_status: specs.fabric_order_status as 'MANUFACTURER WAREHOUSE' | 'PENDING' | 'ORDERED' | 'DELIVERED',
                target_sales_price: product.target_sales_price
            };

            await updateProductionItem(product.id, updates);
            await updateProductMaterials(product.id, materials);
            await updateProductLaborCosts(product.id, laborCosts);
            alert("Saved successfully!");
        } catch (error) {
            console.error("Failed to save", error);
            alert("Error saving data");
        }
    }

    const updateMaterial = (id: string, materialUpdates: Partial<ProductMaterial>) => {
        setMaterials(prev => prev.map(m => {
            if (m.id !== id) return m;
            const updated = { ...m, ...materialUpdates };
            updated.total_amount = (updated.unit_consumption * updated.unit_price) * (1 + updated.waste_rate);
            return updated;
        }));
    };

    const updateLabor = (id: string, laborUpdates: Partial<ProductLaborCost>) => {
        setLaborCosts(prev => prev.map(l => {
            if (l.id !== id) return l;
            return { ...l, ...laborUpdates };
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setImagePreview(url)
        }
    }

    const removeImage = () => {
        setImagePreview(null)
    }

    return (
        <div className="flex flex-col gap-6 pb-20">

            {/* Header Actions */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-20 z-10 w-full mb-2">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-500 rounded-full hover:bg-slate-100">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <Input
                                value={product.model_name}
                                onChange={(e) => setProduct({ ...product, model_name: e.target.value })}
                                className="text-xl font-bold text-slate-900 tracking-tight border-transparent hover:border-slate-200 focus:border-emerald-500 bg-transparent h-auto py-1 px-2 w-64 shadow-none"
                            />
                            <Input
                                value={product.model_code}
                                onChange={(e) => setProduct({ ...product, model_code: e.target.value })}
                                className="font-mono text-sm text-slate-500 bg-slate-50 border-slate-200 h-7 w-28 px-2"
                            />
                            <Input
                                value={product.season}
                                onChange={(e) => setProduct({ ...product, season: e.target.value })}
                                className="bg-emerald-50 text-emerald-700 h-7 w-20 px-2 font-semibold text-xs border-transparent focus:border-emerald-500"
                            />
                            {deadlineBadge && (
                                <Badge variant={deadlineBadge.variant} className={deadlineBadge.colorClass}>
                                    <Clock className="w-3 h-3 mr-1" />
                                    {deadlineBadge.text}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-2">
                            <span className="text-sm text-slate-500">{t("title")}</span>
                            <span className="text-slate-300">&bull;</span>
                            <Input
                                value={product.category}
                                onChange={(e) => setProduct({ ...product, category: e.target.value })}
                                className="text-sm text-slate-500 h-6 border-transparent hover:border-slate-200 bg-transparent px-1 w-28 shadow-none"
                            />
                            <span className="text-slate-300">&bull;</span>
                            <Input
                                value={product.manufacturer}
                                onChange={(e) => setProduct({ ...product, manufacturer: e.target.value })}
                                className="text-sm text-slate-500 h-6 border-transparent hover:border-slate-200 bg-transparent px-1 w-32 shadow-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={product.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200 font-medium">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map(status => (
                                <SelectItem key={status} value={status}>{tStatus(status.replace('/', '_').replace(' ', '_'))}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={handleSave} className="gap-2 bg-kntlgy-blue hover:bg-kntlgy-blue/90 text-white shadow-sm">
                        <Save className="h-4 w-4" />
                        {t("save")}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Column: Image & Dates */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Image Upload Box */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <ImageIcon className="h-3.5 w-3.5" />
                                Product Visual
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="relative aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center overflow-hidden group">
                                {imagePreview ? (
                                    <>
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => document.getElementById('image-upload')?.click()}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                {t("change_image")}
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={removeImage}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => document.getElementById('image-upload')?.click()}>
                                        <div className="p-3 rounded-full bg-slate-100 text-slate-400">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-500">{t("upload_image")}</span>
                                    </div>
                                )}
                                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                {t("dates_tracking")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("target_loading_date")}</label>
                                <Input
                                    type="date"
                                    value={targetLoadingDate}
                                    onChange={(e) => setTargetLoadingDate(e.target.value)}
                                    className="font-mono text-slate-700 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("po_date")}</label>
                                <Input
                                    type="date"
                                    value={poDate}
                                    onChange={(e) => setPoDate(e.target.value)}
                                    className="font-mono text-slate-700 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fabric Arrival</label>
                                <Input
                                    type="date"
                                    value={fabricArrivalDate}
                                    onChange={(e) => setFabricArrivalDate(e.target.value)}
                                    className="font-mono text-slate-700 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cutting Date</label>
                                <Input
                                    type="date"
                                    value={cuttingDate}
                                    onChange={(e) => setCuttingDate(e.target.value)}
                                    className="font-mono text-slate-700 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mfg Deadline</label>
                                <Input
                                    type="date"
                                    value={mfgDeadline}
                                    onChange={(e) => setMfgDeadline(e.target.value)}
                                    className="font-mono text-slate-700 text-sm"
                                />
                            </div>
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Planned Qty</label>
                                <Input
                                    type="number"
                                    value={product.planned_qty}
                                    onChange={(e) => setProduct({ ...product, planned_qty: parseInt(e.target.value) || 0 })}
                                    className="font-bold text-lg text-slate-800 bg-slate-50/50 border-slate-200 font-mono"
                                />
                            </div>
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("received_qty")}</label>
                                <Input
                                    type="number"
                                    value={receivedQty}
                                    onChange={(e) => setReceivedQty(e.target.value)}
                                    className="font-bold text-lg text-emerald-700 bg-emerald-50/50 border-emerald-200"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Costing Calculations & Specs */}
                <div className="lg:col-span-3 flex flex-col gap-6">

                    {/* Material Specifications Card (Phase 3) */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-white border-b border-slate-100 py-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                <Tag className="h-4 w-4 text-emerald-500" />
                                {t("material_specs")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">{t("fabric_supplier")}</Label>
                                    <Input
                                        value={specs.fabric_supplier}
                                        onChange={(e) => setSpecs({ ...specs, fabric_supplier: e.target.value })}
                                        className="h-9 text-sm"
                                        placeholder="e.g. SÖKTAŞ"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">{t("fabric_quality")}</Label>
                                    <Input
                                        value={specs.fabric_quality}
                                        onChange={(e) => setSpecs({ ...specs, fabric_quality: e.target.value })}
                                        className="h-9 text-sm"
                                        placeholder="e.g. MALDIVE"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">{t("fabric_composition")}</Label>
                                    <Input
                                        value={specs.fabric_composition}
                                        onChange={(e) => setSpecs({ ...specs, fabric_composition: e.target.value })}
                                        className="h-9 text-sm"
                                        placeholder="e.g. 100% Cotton"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">{t("lining_detail")}</Label>
                                    <Input
                                        value={specs.lining_detail}
                                        onChange={(e) => setSpecs({ ...specs, lining_detail: e.target.value })}
                                        className="h-9 text-sm"
                                        placeholder="e.g. TWILL"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">{t("color_name")}</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={specs.color_name}
                                            onChange={(e) => setSpecs({ ...specs, color_name: e.target.value })}
                                            className="h-9 text-sm flex-1"
                                            placeholder="BLACK"
                                        />
                                        <Input
                                            value={specs.color_code}
                                            onChange={(e) => setSpecs({ ...specs, color_code: e.target.value })}
                                            className="h-9 text-sm w-20 font-mono"
                                            placeholder="800"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">{t("fabric_order_status")}</Label>
                                    <Select
                                        value={specs.fabric_order_status}
                                        onValueChange={(val) => setSpecs({ ...specs, fabric_order_status: val as 'MANUFACTURER WAREHOUSE' | 'PENDING' | 'ORDERED' | 'DELIVERED' })}
                                    >
                                        <SelectTrigger className="h-9 text-sm bg-slate-50 border-slate-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">{t("fabric_status.PENDING")}</SelectItem>
                                            <SelectItem value="ORDERED">{t("fabric_status.ORDERED")}</SelectItem>
                                            <SelectItem value="MANUFACTURER WAREHOUSE">{t("fabric_status.MANUFACTURER_WAREHOUSE")}</SelectItem>
                                            <SelectItem value="DELIVERED">{t("fabric_status.DELIVERED")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Materials Table Placeholder */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-slate-500" />
                                <CardTitle className="text-sm font-semibold text-slate-700">
                                    {t("materials_table")}
                                </CardTitle>
                            </div>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                    const newMat: ProductMaterial = {
                                        id: `mat-${Date.now()}`,
                                        product_id: product.id,
                                        material_type: 'Main Fabric',
                                        supplier: '',
                                        quality: '',
                                        unit_consumption: 0,
                                        unit_price: 0,
                                        waste_rate: 0,
                                        total_amount: 0,
                                        order_status: 'PENDING',
                                        notes: ''
                                    };
                                    setMaterials(prev => [...prev, newMat]);
                                }}
                                className="h-8 shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                {t("add_material")}
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto text-sm">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-semibold tracking-wider text-slate-500">
                                    <tr>
                                        <th className="p-3 pl-4">{t("material_type")}</th>
                                        <th className="p-3">Supplier</th>
                                        <th className="p-3">Quality</th>
                                        <th className="p-3 text-right">{t("unit_consumption")}</th>
                                        <th className="p-3 text-right">{t("unit_price")}</th>
                                        <th className="p-3 text-center">{t("waste_rate")}</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">{t("notes")}</th>
                                        <th className="p-3 text-right pr-4">{t("total")}</th>
                                        <th className="p-3 pr-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.filter(m => m.material_type !== 'Accessory').map((mat) => (
                                        <tr key={mat.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                            <td className="p-2 pl-4">
                                                <Select value={mat.material_type} onValueChange={(val) => updateMaterial(mat.id, { material_type: val })}>
                                                    <SelectTrigger className="h-8 text-xs border-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Main Fabric">{t("material_categories.MAIN_FABRIC")}</SelectItem>
                                                        <SelectItem value="Lining">{t("material_categories.LINING")}</SelectItem>
                                                        <SelectItem value="Garni">{t("material_categories.GARNI")}</SelectItem>
                                                        <SelectItem value="Button">{t("material_categories.BUTTON")}</SelectItem>
                                                        <SelectItem value="Zipper">{t("material_categories.ZIPPER")}</SelectItem>
                                                        <SelectItem value="Label">{t("material_categories.LABEL")}</SelectItem>
                                                        <SelectItem value="Packaging">{t("material_categories.PACKAGING")}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    value={mat.supplier}
                                                    onChange={e => updateMaterial(mat.id, { supplier: e.target.value })}
                                                    className="h-8 text-xs w-28"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    value={mat.quality}
                                                    onChange={e => updateMaterial(mat.id, { quality: e.target.value })}
                                                    className="h-8 text-xs w-28"
                                                    placeholder="Fabric type..."
                                                />
                                            </td>
                                            <td className="p-2 w-24">
                                                <Input
                                                    type="number"
                                                    value={mat.unit_consumption}
                                                    onChange={e => updateMaterial(mat.id, { unit_consumption: parseFloat(e.target.value) || 0 })}
                                                    className="h-8 text-xs text-right"
                                                />
                                            </td>
                                            <td className="p-2 w-24">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-2 text-xs text-slate-400">$</span>
                                                    <Input
                                                        type="number"
                                                        value={mat.unit_price}
                                                        onChange={e => updateMaterial(mat.id, { unit_price: parseFloat(e.target.value) || 0 })}
                                                        className="h-8 text-xs text-right pl-5"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-2 w-20">
                                                <div className="relative">
                                                    <span className="absolute right-2 top-2 text-xs text-slate-400">%</span>
                                                    <Input
                                                        type="number"
                                                        value={mat.waste_rate * 100}
                                                        onChange={e => updateMaterial(mat.id, { waste_rate: (parseFloat(e.target.value) || 0) / 100 })}
                                                        className="h-8 text-xs text-right pr-6"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-2 w-32">
                                                <Select value={mat.order_status} onValueChange={(val) => updateMaterial(mat.id, { order_status: val as ProductMaterial['order_status'] })}>
                                                    <SelectTrigger className="h-8 text-xs border-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">Pending</SelectItem>
                                                        <SelectItem value="ORDERED">Ordered</SelectItem>
                                                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-2 w-32">
                                                <Input
                                                    value={mat.notes || ''}
                                                    onChange={e => updateMaterial(mat.id, { notes: e.target.value })}
                                                    className="h-8 text-xs"
                                                    placeholder="Remarks..."
                                                />
                                            </td>
                                            <td className="p-2 text-right font-bold text-emerald-700 w-24">
                                                ${mat.total_amount.toFixed(2)}
                                            </td>
                                            <td className="p-2 pr-4 text-right">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setMaterials(prev => prev.filter(m => m.id !== mat.id))}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {materials.filter(m => m.material_type !== 'Accessory').length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="p-8 text-center text-slate-400">No materials recorded.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Accessories & Trims Table (Phase 3) */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-slate-500" />
                                <CardTitle className="text-sm font-semibold text-slate-700">
                                    Accessories & Trims (Aksesuarlar)
                                </CardTitle>
                            </div>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                    const newAcc: ProductMaterial = {
                                        id: `acc-${Date.now()}`,
                                        product_id: product.id,
                                        material_type: 'Accessory',
                                        supplier: '',
                                        quality: '',
                                        unit_consumption: 0,
                                        unit_price: 0,
                                        waste_rate: 0,
                                        total_amount: 0,
                                        order_status: 'PENDING',
                                        notes: ''
                                    };
                                    setMaterials(prev => [...prev, newAcc]);
                                }}
                                className="h-8 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Accessory
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto text-sm">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-semibold tracking-wider text-slate-500">
                                    <tr>
                                        <th className="p-3 pl-4">Accessory Name</th>
                                        <th className="p-3">Supplier</th>
                                        <th className="p-3 text-right">Usage Qty</th>
                                        <th className="p-3 text-right">Unit Price</th>
                                        <th className="p-3 text-right">Total</th>
                                        <th className="p-3">Order Status</th>
                                        <th className="p-3 pr-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.filter(m => m.material_type === 'Accessory').map((mat) => (
                                        <tr key={mat.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                            <td className="p-2 pl-4">
                                                <Input
                                                    value={mat.quality}
                                                    onChange={e => updateMaterial(mat.id, { quality: e.target.value })}
                                                    placeholder="e.g. Button"
                                                    className="h-8 text-xs"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    value={mat.supplier}
                                                    onChange={e => updateMaterial(mat.id, { supplier: e.target.value })}
                                                    className="h-8 text-xs"
                                                />
                                            </td>
                                            <td className="p-2 w-24">
                                                <Input
                                                    type="number"
                                                    value={mat.unit_consumption}
                                                    onChange={e => updateMaterial(mat.id, { unit_consumption: parseFloat(e.target.value) || 0 })}
                                                    className="h-8 text-xs text-right"
                                                />
                                            </td>
                                            <td className="p-2 w-24">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-2 text-xs text-slate-400">$</span>
                                                    <Input
                                                        type="number"
                                                        value={mat.unit_price}
                                                        onChange={e => updateMaterial(mat.id, { unit_price: parseFloat(e.target.value) || 0 })}
                                                        className="h-8 text-xs text-right pl-5"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-2 text-right font-bold text-emerald-700 w-24">
                                                ${mat.total_amount.toFixed(2)}
                                            </td>
                                            <td className="p-2 w-36">
                                                <Select value={mat.order_status} onValueChange={(val) => updateMaterial(mat.id, { order_status: val as ProductMaterial['order_status'] })}>
                                                    <SelectTrigger className="h-8 text-xs border-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">Pending</SelectItem>
                                                        <SelectItem value="ORDERED">Ordered</SelectItem>
                                                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-2 pr-4 text-right">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setMaterials(prev => prev.filter(m => m.id !== mat.id))}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {materials.filter(m => m.material_type === 'Accessory').length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-slate-400">No accessories added yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Labor Cost Table Placeholder */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <UserSquare2 className="h-4 w-4 text-slate-500" />
                                <CardTitle className="text-sm font-semibold text-slate-700">
                                    {t("labor_table")}
                                </CardTitle>
                            </div>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                    const newLabor: ProductLaborCost = {
                                        id: `labor-${Date.now()}`,
                                        product_id: product.id,
                                        operation_name: '',
                                        cost_amount: 0
                                    };
                                    setLaborCosts(prev => [...prev, newLabor]);
                                }}
                                className="h-8 shadow-sm bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                {t("add_labor")}
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 text-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-semibold tracking-wider text-slate-500">
                                    <tr>
                                        <th className="p-3 pl-4">Operation</th>
                                        <th className="p-3 text-right pr-4">Cost ($)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {laborCosts.map((labor) => (
                                        <tr key={labor.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                            <td className="p-2 pl-4">
                                                <Input
                                                    value={labor.operation_name}
                                                    onChange={e => updateLabor(labor.id, { operation_name: e.target.value })}
                                                    placeholder="Operation name..."
                                                    className="h-8 text-xs"
                                                />
                                            </td>
                                            <td className="p-2 w-32">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-2 text-xs text-slate-400">$</span>
                                                    <Input
                                                        type="number"
                                                        value={labor.cost_amount}
                                                        onChange={e => updateLabor(labor.id, { cost_amount: parseFloat(e.target.value) || 0 })}
                                                        className="h-8 text-xs text-right pl-5"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-2 pr-4 text-right w-12">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setLaborCosts(prev => prev.filter(l => l.id !== labor.id))}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {laborCosts.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-slate-400">No labor records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Profitability Summary Placeholder */}
                    <Card className="border-emerald-200 shadow-sm bg-emerald-50/30">
                        <CardHeader className="border-b border-emerald-100 py-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-800">
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                                {t("profitability_summary")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-emerald-700/80 font-medium">{t("total_material_cost")}</span>
                                    <span className="font-mono text-emerald-900 font-bold">${materials.reduce((acc, m) => acc + m.total_amount, 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-emerald-700/80 font-medium">{t("total_labor_cost")}</span>
                                    <span className="font-mono text-emerald-900 font-bold">${laborCosts.reduce((acc, l) => acc + l.cost_amount, 0).toFixed(2)}</span>
                                </div>
                                <div className="pt-4 border-t border-emerald-200/50 flex justify-between items-center bg-emerald-100/30 p-3 rounded-lg">
                                    <span className="text-emerald-800 font-bold">{t("total_unit_cost")}</span>
                                    <span className="font-mono text-emerald-900 font-black text-lg">
                                        ${(
                                            materials.reduce((acc, m) => acc + m.total_amount, 0) +
                                            laborCosts.reduce((acc, l) => acc + l.cost_amount, 0)
                                        ).toFixed(2)}
                                    </span>
                                </div>

                                <div className="pt-2 space-y-2">
                                    <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">{t("target_selling_price")} ($)</label>
                                    <Input
                                        type="number"
                                        value={product.target_sales_price}
                                        onChange={(e) => setProduct({ ...product, target_sales_price: parseFloat(e.target.value) || 0 })}
                                        className="font-mono text-lg font-bold border-emerald-300 bg-white"
                                    />
                                </div>

                                <div className="pt-4 border-t border-emerald-200/50 flex flex-col gap-1 items-center justify-center bg-emerald-600 text-white p-4 rounded-xl shadow-inner mt-2">
                                    <span className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">{t("profit_margin")}</span>
                                    <span className="font-mono font-black text-3xl">
                                        {product.target_sales_price > 0
                                            ? (((product.target_sales_price - (materials.reduce((acc, m) => acc + m.total_amount, 0) + laborCosts.reduce((acc, l) => acc + l.cost_amount, 0))) / product.target_sales_price) * 100).toFixed(1)
                                            : "0.0"}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div >

            </div >

        </div >
    )
}
