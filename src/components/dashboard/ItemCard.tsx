"use client";

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities";
import { ProductionItem } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Layers, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { getDeadlineBadge, getMaterialAlertBadge } from "@/lib/dateUtils";
import { Package } from "lucide-react";

interface ItemCardProps {
    item: ProductionItem;
    isOverlay?: boolean;
}

export function ItemCard({ item, isOverlay }: ItemCardProps) {
    const router = useRouter();
    const locale = useLocale();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
        data: {
            type: "Item",
            item,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const handleDoubleClick = () => {
        // Navigate to Detailed Costing page for this product
        router.push(`/${locale}/product/${item.id}`);
    };

    const targetDateFormatted = item.target_loading_date ? format(new Date(item.target_loading_date), "MMM d") : 'Not set';
    const deadlineBadge = getDeadlineBadge(item.target_loading_date, item.status);
    const materialBadge = getMaterialAlertBadge(item.fabric_order_status, item.cutting_date);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onDoubleClick={handleDoubleClick}
            className={cn(
                "cursor-grab active:cursor-grabbing",
                isOverlay && "rotate-2 scale-105"
            )}
        >
            <Card className={cn(
                "shadow-sm hover:shadow-md transition-shadow border-slate-200",
                isDragging && "ring-2 ring-emerald-500/50"
            )}>
                {item.image_url && (
                    <div className="w-full h-32 overflow-hidden border-b border-slate-100">
                        <img src={item.image_url} alt={item.model_name} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                    </div>
                )}
                <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] tracking-tight bg-slate-50 text-slate-500 border-slate-200">
                            {item.model_code}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0 text-[10px]">
                            {item.season}
                        </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold leading-tight pt-1 group-hover:text-emerald-700 transition-colors">
                        {item.model_name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Layers className="h-3 w-3" />
                        <span className="truncate">{item.manufacturer}</span>
                        <span className="mx-1">&bull;</span>
                        <span>{item.planned_qty} pcs</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 rounded-md p-1.5 px-2 border border-slate-100">
                        <Calendar className="h-3 w-3 text-emerald-600" />
                        <span>Target: <strong className="text-slate-700">{targetDateFormatted}</strong></span>
                    </div>

                    {deadlineBadge && (
                        <Badge variant={deadlineBadge.variant} className={cn("text-[10px] w-full flex justify-center py-1 mt-1", deadlineBadge.colorClass)}>
                            <Clock className="w-3 h-3 mr-1" />
                            {deadlineBadge.text}
                        </Badge>
                    )}

                    {materialBadge && (
                        <Badge variant={materialBadge.variant} className={cn("text-[10px] w-full flex justify-center py-1 mt-1", materialBadge.colorClass)}>
                            <Package className="w-3 h-3 mr-1" />
                            {materialBadge.text}
                        </Badge>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
