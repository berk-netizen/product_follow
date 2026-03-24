"use client";

import { useState, useEffect } from "react";
import { ProductionItem } from "@/types";
import { getProductionItems } from "@/lib/mockData";
import SampleKanbanBoard from "./SampleKanbanBoard";
import { FlaskConical } from "lucide-react";

export default function SamplesClient() {
    const [items, setItems] = useState<ProductionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const all = await getProductionItems();
                // Only show items flagged as samples (is_sample: true, or not yet set)
                setItems(all.filter(item => item.is_sample === true));
            } catch (err) {
                console.error("Failed to fetch sample items", err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse font-medium">
                Numune verileri yükleniyor...
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
                            Numune Takip
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm pl-12">
                        {items.length} aktif numune takip ediliyor
                    </p>
                </div>
            </div>

            {/* Board */}
            <div className="mt-2 rounded-2xl overflow-hidden min-h-[500px]">
                {items.length === 0 ? (
                    <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 border border-dashed border-border rounded-2xl gap-3">
                        <FlaskConical className="w-12 h-12 opacity-20" />
                        <p className="font-medium">Henüz numune bulunmuyor.</p>
                        <p className="text-xs opacity-60">Yeni ürün eklerken is_sample alanını true olarak ayarlayın.</p>
                    </div>
                ) : (
                    <SampleKanbanBoard initialItems={items} />
                )}
            </div>
        </div>
    );
}
