"use client";

import Image from "next/image";

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities";
import { ProductionItem } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Layers, Clock, Tag, Package, CheckCircle2, AlertCircle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { getDeadlineBadge, getMaterialAlertBadge } from "@/lib/dateUtils";
import { Mail, Trash2 } from "lucide-react";

interface ItemCardProps {
    item: ProductionItem;
    isOverlay?: boolean;
    onDelete?: (id: string) => void;
}

export function ItemCard({ item, isOverlay, onDelete }: ItemCardProps) {
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

    // Delay Tracking Logic
    const isDelayed = item.delivery_date 
        ? new Date() > new Date(item.delivery_date) && !['SHIPPED', 'IN WAREHOUSE'].includes(item.status)
        : false;
        
    const delayDays = isDelayed && item.delivery_date 
        ? differenceInDays(new Date(), new Date(item.delivery_date))
        : 0;

    const handleDraftEmail = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // Default to Üretici template since supplier_type is removed from DB
        let subject = `Sipariş Gecikmesi: ${item.model_name} / ${item.model_code}`;
        let body = `Sayın ${item.manufacturer || 'İlgili'},\n\n${item.model_name} (${item.model_code}) referanslı siparişimizin üretim aşamasında geciktiğini tespit ettik. \n\nHedef Tarih: ${targetDateFormatted}\nGecikme: ${delayDays} gün.\n\nGüncel üretim durumu ve kesin sevkiyat tarihi hakkında acil bilgi rica ederiz.\n\nİyi çalışmalar.`;

        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this product?")) {
            if (onDelete) {
                onDelete(item.id);
            }
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onDoubleClick={handleDoubleClick}
            className={cn(
                "cursor-grab active:cursor-grabbing",
                isOverlay && "rotate-2 scale-105 opacity-80"
            )}
        >
            <Card className={cn(
                "group relative overflow-hidden transition-all duration-300",
                "bg-card text-card-foreground border-border shadow-sm hover:shadow-md",
                "isDragging && ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
                isDelayed && "ring-2 ring-destructive ring-offset-2 ring-offset-background shadow-[0_0_15px_rgba(220,38,38,0.3)] animate-pulse border-destructive/50"
            )}>
                {isDelayed && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-destructive pointer-events-none z-10" />
                )}
                {!isOverlay && onDelete && (
                    <button
                        onClick={handleDeleteClick}
                        className="absolute top-2 right-2 p-1.5 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all z-20"
                        title="Delete Product"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
                {item.image_url && (
                    <div className="relative w-full h-36 overflow-hidden border-b border-border/50">
                        <Image
                            src={item.image_url}
                            alt={item.model_name}
                            fill
                            className="object-cover transition-transform hover:scale-105 duration-500"
                        />
                    </div>
                )}
                <CardHeader className="p-4 pb-2 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] tracking-tight bg-muted/50 text-muted-foreground border-border">
                            {item.model_code}
                        </Badge>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 text-[10px]">
                            {item.season}
                        </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold leading-tight pt-1 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors text-foreground font-playfair">
                        {item.model_name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <Layers className="h-3 w-3" />
                            <span className="truncate">{item.manufacturer}</span>
                            <span className="mx-1">&bull;</span>
                            <span>{item.planned_qty} pcs</span>
                        </div>
                        {item.target_sales_price > 0 && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-muted/50 rounded-full px-2 py-0.5 border border-border">
                                <Tag className="h-3 w-3 text-emerald-500" />
                                <span>${item.target_sales_price}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium bg-muted/30 rounded-md p-2 border border-border/50 relative">
                        {isDelayed && (
                            <div className="absolute -top-3 -right-2 bg-destructive text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-sm animate-pulse">
                                <AlertOctagon className="w-2.5 h-2.5 mr-1" />
                                {delayDays} GÜN GECİKTİ
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3 w-3 text-emerald-500" />
                            <span>Target: <strong className="text-foreground">{targetDateFormatted}</strong></span>
                        </div>
                        
                        {/* Stock Status Indicator */}
                        <div className="flex items-center gap-2">
                            {isDelayed && (
                                <button 
                                    onClick={handleDraftEmail}
                                    className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded-lg transition-all shadow-sm flex items-center justify-center group"
                                    title="E-posta Taslağı Oluştur"
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                </button>
                            )}
                            {item.fabric_order_status === 'DELIVERED' || item.status === 'IN WAREHOUSE' || item.status === 'SHIPPED' ? (
                                <div className="flex items-center gap-1 text-emerald-400" title="In Stock">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span className="text-[10px]">Stock</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-destructive font-semibold" title="Out of Stock / Pending">
                                    <AlertCircle className="h-3 w-3" />
                                    <span className="text-[10px]">Out</span>
                                </div>
                            )}
                        </div>
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
