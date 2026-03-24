"use client";

import { useState, useCallback } from "react";
import { ProductionItem, SampleStatus } from "@/types";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SampleKanbanColumn } from "./SampleKanbanColumn";
import { SampleItemCard } from "./SampleItemCard";
import { updateProductionItem, deleteProduct } from "@/lib/mockData";

const SAMPLE_COLUMNS: { status: SampleStatus; title: string; emoji: string; accentColor: string }[] = [
    { status: 'NUMUNE TALEP',             title: 'Numune Talep',              emoji: '📋', accentColor: 'text-sky-400' },
    { status: 'DİKİM AŞAMASINDA',         title: 'Dikim Aşamasında',          emoji: '🧵', accentColor: 'text-amber-400' },
    { status: 'MÜŞTERİYE GÖNDERİLDİ',    title: 'Müşteriye Gönderildi',      emoji: '📦', accentColor: 'text-blue-400' },
    { status: 'REVİZE İSTENDİ',           title: 'Revize İstendi',            emoji: '✏️', accentColor: 'text-rose-400' },
    { status: 'ONAYLANDI / ÜRETİME HAZIR', title: 'Onaylandi – Üretime Hazır', emoji: '✅', accentColor: 'text-emerald-400' },
];

interface SampleKanbanBoardProps {
    initialItems: ProductionItem[];
}

export default function SampleKanbanBoard({ initialItems }: SampleKanbanBoardProps) {
    const [items, setItems] = useState<ProductionItem[]>(initialItems);
    const [activeId, setActiveId] = useState<string | null>(null);

    const [emblaRef, emblaApi] = useEmblaCarousel({
        dragFree: true,
        containScroll: "trimSnaps",
        align: "start",
    });

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        const activeIdStr = active.id as string;
        const overIdStr = over.id as string;
        if (activeIdStr === overIdStr) return;

        const columnIds = SAMPLE_COLUMNS.map(c => c.status as string);

        setItems((prev) => {
            const isOverColumn = columnIds.includes(overIdStr);
            const activeIndex = prev.findIndex((i) => i.id === activeIdStr);
            const overIndex = prev.findIndex((i) => i.id === overIdStr);

            if (!isOverColumn && activeIndex !== -1 && overIndex !== -1) {
                const activeItem = prev[activeIndex];
                const overItem = prev[overIndex];

                if (activeItem.sample_status !== overItem.sample_status) {
                    const newStatus = overItem.sample_status!;
                    updateProductionItem(activeItem.id, { sample_status: newStatus });
                    const newItems = [...prev];
                    newItems[activeIndex] = { ...activeItem, sample_status: newStatus };
                    return arrayMove(newItems, activeIndex, overIndex);
                }
                return arrayMove(prev, activeIndex, overIndex);
            }

            if (isOverColumn && activeIndex !== -1) {
                const activeItem = prev[activeIndex];
                const overStatus = overIdStr as SampleStatus;
                if (activeItem.sample_status !== overStatus) {
                    updateProductionItem(activeItem.id, { sample_status: overStatus });
                    const newItems = [...prev];
                    newItems[activeIndex] = { ...activeItem, sample_status: overStatus };
                    return newItems;
                }
            }

            return prev;
        });
    };

    const handleDelete = async (id: string) => {
        const success = await deleteProduct(id);
        if (success) setItems((prev) => prev.filter((item) => item.id !== id));
        else alert("Silme işlemi başarısız oldu.");
    };

    const handleSendToProduction = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const activeItem = activeId ? items.find((item) => item.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="relative w-full">
                <button
                    onClick={scrollPrev}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="overflow-hidden mx-6" ref={emblaRef}>
                    <div className="flex gap-4 pb-4">
                        {SAMPLE_COLUMNS.map((col) => (
                            <div key={col.status} className="flex-none w-[290px]">
                                <SampleKanbanColumn
                                    status={col.status}
                                    title={col.title}
                                    emoji={col.emoji}
                                    accentColor={col.accentColor}
                                    items={items.filter((item) => item.sample_status === col.status)}
                                    onDelete={handleDelete}
                                    onSendToProduction={handleSendToProduction}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={scrollNext}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="flex justify-center gap-1.5 mt-3">
                {SAMPLE_COLUMNS.map((col, i) => (
                    <button
                        key={col.status}
                        onClick={() => emblaApi?.scrollTo(i)}
                        className="h-1.5 w-1.5 rounded-full bg-zinc-600 hover:bg-zinc-400 transition-all"
                    />
                ))}
            </div>

            <DragOverlay>
                {activeItem ? (
                    <SampleItemCard
                        item={activeItem}
                        isOverlay
                        currentColumn={activeItem.sample_status ?? 'NUMUNE TALEP'}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
