"use client";

import { ProductionItem, Status } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ItemCard } from "./ItemCard";

interface KanbanColumnProps {
    status: Status;
    title: string;
    items: ProductionItem[];
}

export function KanbanColumn({ title, items }: KanbanColumnProps) {
    return (
        <div className="flex flex-col gap-3 min-w-[320px] max-w-[320px] w-full shrink-0 bg-slate-800/30 backdrop-blur-md rounded-xl p-3 h-full pb-4 border border-white/5 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-1">
                <h3 className="font-semibold text-sm text-slate-300 tracking-wide">{title}</h3>
                <Badge variant="outline" className="px-2 py-0.5 rounded-full text-xs font-mono shadow-sm border-white/10 bg-black/20 text-slate-300">
                    {items.length}
                </Badge>
            </div>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}
