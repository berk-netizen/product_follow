"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ProductionItem, SampleStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { SampleItemCard } from "./SampleItemCard";
import { cn } from "@/lib/utils";

interface SampleKanbanColumnProps {
    status: SampleStatus;
    title: string;
    emoji: string;
    accentColor: string;
    items: ProductionItem[];
    onDelete?: (id: string) => void;
    onSendToProduction?: (id: string) => void;
}

export function SampleKanbanColumn({ status, title, emoji, accentColor, items, onDelete, onSendToProduction }: SampleKanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col gap-3 min-w-[290px] max-w-[290px] w-full shrink-0 rounded-2xl p-4 pb-6 border transition-all duration-200",
                isOver ? "border-emerald-500/60 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "border-border/40"
            )}
        >
            <div className="flex items-center justify-between pb-3 border-b border-border mb-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm">{emoji}</span>
                    <h3 className={cn("font-semibold text-[11px] uppercase tracking-wider", accentColor)}>
                        {title}
                    </h3>
                </div>
                <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-background border border-border text-foreground">
                    {items.length}
                </Badge>
            </div>

            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 max-h-[calc(100vh-280px)]">
                    {items.map((item) => (
                        <SampleItemCard
                            key={item.id}
                            item={item}
                            currentColumn={status}
                            onDelete={onDelete}
                            onSendToProduction={onSendToProduction}
                        />
                    ))}
                    {items.length === 0 && (
                        <div className="flex items-center justify-center h-20 rounded-xl border border-dashed border-border/50 text-muted-foreground/30 text-xs">
                            Empty — drop a card here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}
