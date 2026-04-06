"use client";

import { useState, useEffect } from "react";
import { ProductionItem, SampleStatus } from "@/types";
import { getProductionItems, createProductionItem } from "@/lib/mockData";
import SampleKanbanBoard from "./SampleKanbanBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { FlaskConical, Plus } from "lucide-react";

const DEFAULT_SAMPLE_STATUS: SampleStatus = "REQUESTED";

export default function SamplesClient() {
    const [items, setItems] = useState<ProductionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        model_code: "",
        model_name: "",
        season: "",
        manufacturer: "",
        planned_qty: 0,
    });

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const all = await getProductionItems();
                setItems(all.filter(item => item.is_sample === true));
            } catch (err) {
                console.error("Failed to fetch sample items", err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const handleAddSample = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const newSample = await createProductionItem({
            ...formData,
            is_sample: true,
            sample_status: DEFAULT_SAMPLE_STATUS,
            status: "SAMPLE SEWN",
            category: "Sample",
            sizes_breakdown: {},
            po_date: null,
            fabric_arrival_date: null,
            cutting_date: null,
            actual_mfg_deadline: null,
            target_loading_date: null,
            image_url: null,
            main_image_url: null,
            fabric_supplier: null,
            fabric_quality: null,
            fabric_composition: null,
            lining_detail: null,
            color_name: null,
            color_code: null,
            fabric_order_status: "PENDING",
            received_qty: 0,
            target_sales_price: 0,
            final_sales_price_tl: 0,
        });
        setIsSaving(false);
        if (newSample) {
            setItems(prev => [newSample, ...prev]);
        }
        setDialogOpen(false);
        setFormData({ model_code: "", model_name: "", season: "", manufacturer: "", planned_qty: 0 });
    };

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse font-medium">
                Loading sample data...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                            <FlaskConical className="w-4 h-4 text-sky-400" />
                        </div>
                        <h1 className="text-2xl font-bold font-playfair tracking-tight text-foreground">
                            Sample Tracking
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm pl-12">
                        {items.length} active {items.length === 1 ? "sample" : "samples"} tracked
                    </p>
                </div>
                <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2 rounded-xl"
                    onClick={() => setDialogOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    New Sample
                </Button>
            </div>

            {/* Board — always visible */}
            <div className="mt-2 rounded-2xl overflow-hidden min-h-[500px]">
                <SampleKanbanBoard initialItems={items} />
            </div>

            {/* New Sample Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl border-border bg-card">
                    <form onSubmit={handleAddSample}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold font-playfair">New Sample</DialogTitle>
                            <DialogDescription className="text-muted-foreground text-xs">
                                Create a new sample request. It will appear in the "Requested" column.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-6">
                            {[
                                { id: "sample-code",  label: "Model Code",   key: "model_code",   placeholder: "e.g. JCK-102" },
                                { id: "sample-name",  label: "Model Name",   key: "model_name",   placeholder: "e.g. Summer Blazer" },
                                { id: "sample-seas",  label: "Season",       key: "season",       placeholder: "e.g. SS25" },
                                { id: "sample-manuf", label: "Manufacturer", key: "manufacturer", placeholder: "e.g. GLOBAL ART" },
                            ].map(field => (
                                <div key={field.id} className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={field.id} className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                        {field.label}
                                    </Label>
                                    <Input
                                        id={field.id}
                                        value={(formData as Record<string, string | number>)[field.key] as string}
                                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                        className="col-span-3 h-10 bg-muted/30 border-border font-mono"
                                        placeholder={field.placeholder}
                                        required
                                    />
                                </div>
                            ))}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sample-qty" className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                    Planned Qty
                                </Label>
                                <Input
                                    id="sample-qty"
                                    type="number"
                                    value={formData.planned_qty}
                                    onChange={e => setFormData({ ...formData, planned_qty: parseInt(e.target.value) || 0 })}
                                    className="col-span-3 h-10 bg-muted/30 border-border font-mono font-bold"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSaving} className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl">
                                {isSaving ? "Creating..." : "Create Sample"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
