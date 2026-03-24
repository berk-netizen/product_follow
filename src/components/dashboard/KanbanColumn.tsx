"use client";

import { ProductionItem, Status } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ItemCard } from "./ItemCard";

interface KanbanColumnProps {
    status: Status;
    title: string;
    items: ProductionItem[];
    onDelete?: (id: string) => void;
}

export function KanbanColumn({ title, items, onDelete }: KanbanColumnProps) {
    return (
        <div className="flex flex-col gap-3 min-w-[320px] max-w-[320px] w-full shrink-0 rounded-2xl p-4 h-full pb-6 border border-border/40 shadow-none">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-2">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">{title}</h3>
                <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-background border border-border text-foreground">
                    {items.length}
                </Badge>
            </div>

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item) => (
                    <ItemCard key={item.id} item={item} onDelete={onDelete} />
                ))}
            </div>
        </div>
    );
}
