"use client";

import { useState } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { ProductionItem, SampleStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, ArrowRight, Loader2, Trash2 } from "lucide-react";
import { updateProductionItem, deleteProduct } from "@/lib/mockData";

interface SampleItemCardProps {
    item: ProductionItem;
    isOverlay?: boolean;
    onDelete?: (id: string) => void;
    onSendToProduction?: (id: string) => void;
    currentColumn: SampleStatus;
}

export function SampleItemCard({ item, isOverlay, onDelete, onSendToProduction, currentColumn }: SampleItemCardProps) {
    const [isSending, setIsSending] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const handleSendToProduction = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to send "${item.model_name}" to production? It will be removed from the samples list.`)) return;
        setIsSending(true);
        await updateProductionItem(item.id, { is_sample: false, status: 'IN CUTTING' });
        setIsSending(false);
        if (onSendToProduction) onSendToProduction(item.id);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this sample?")) {
            if (onDelete) onDelete(item.id);
        }
    };

    const displayImage = item.main_image_url || item.image_url;
    const isApproved = currentColumn === 'APPROVED';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "cursor-grab active:cursor-grabbing",
                isOverlay && "rotate-2 scale-105 opacity-80"
            )}
        >
            <Card className={cn(
                "group relative overflow-hidden transition-all duration-300",
                "bg-card text-card-foreground border-border shadow-sm hover:shadow-md",
                isApproved && "ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            )}>
                {/* Delete button */}
                {!isOverlay && onDelete && (
                    <button
                        onClick={handleDelete}
                        className="absolute top-2 right-2 p-1.5 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all z-20"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Cover Image */}
                <div className="relative w-full h-28 overflow-hidden border-b border-border/50 bg-muted/30 flex flex-col items-center justify-center">
                    {displayImage ? (
                        <Image
                            src={displayImage}
                            alt={item.model_name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                            <ImageIcon className="w-6 h-6 mb-1 opacity-20" />
                            <span className="text-[9px] font-bold uppercase tracking-wider opacity-20 italic">No Image</span>
                        </div>
                    )}
                </div>

                <CardHeader className="p-3 pb-1 space-y-1.5">
                    <div className="flex justify-between items-start gap-2 pr-6">
                        <Badge variant="outline" className="font-mono text-[10px] tracking-tight bg-muted/50 text-muted-foreground border-border">
                            {item.model_code}
                        </Badge>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 text-[10px]">
                            {item.season}
                        </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold leading-tight font-playfair text-foreground group-hover:text-emerald-500 transition-colors">
                        {item.model_name}
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-3 pt-1 space-y-2">
                    <p className="text-xs text-muted-foreground">{item.manufacturer}</p>

                    {/* Send to Production Button – only in ONAYLANDI column */}
                    {isApproved && !isOverlay && (
                        <Button
                            size="sm"
                            className="w-full h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-2 mt-2"
                            onClick={handleSendToProduction}
                            disabled={isSending}
                        >
                            {isSending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                    Send to Production
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
