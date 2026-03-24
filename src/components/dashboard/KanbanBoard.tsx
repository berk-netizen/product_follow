"use client";

import { useState, useRef, useCallback } from "react";
import { ProductionItem, Status } from "@/types";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { KanbanColumn } from "./KanbanColumn";
import { ItemCard } from "./ItemCard";
import { updateProductionItem, deleteProduct } from "@/lib/mockData";

const STATUS_COLUMNS: Status[] = [
    'SAMPLE SEWN',
    'WAITING FABRIC',
    'IN CUTTING',
    'IN SEWING',
    'IRON/PACK',
    'IN WAREHOUSE',
    'SHIPPED'
];

const COLUMN_WIDTH = 320; // px

interface KanbanBoardProps {
    initialItems: ProductionItem[];
}

export default function KanbanBoard({ initialItems }: KanbanBoardProps) {
    const t = useTranslations("Status");
    const [items, setItems] = useState<ProductionItem[]>(initialItems);
    const [activeId, setActiveId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // ── Wheel → horizontal scroll ────────────────────────────────────────────
    const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
        if (!scrollRef.current) return;
        // Only intercept if not dragging
        if (activeId) return;
        e.preventDefault();
        scrollRef.current.scrollLeft += e.deltaY + e.deltaX;
    }, [activeId]);

    const scrollBy = (dir: 1 | -1) => {
        scrollRef.current?.scrollBy({ left: dir * (COLUMN_WIDTH + 16), behavior: "smooth" });
    };

    // ── DnD sensors – distance:8 avoids premature drag on scroll ────────────
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

        setItems((prev) => {
            const isOverColumn = STATUS_COLUMNS.includes(overIdStr as Status);
            const activeIndex = prev.findIndex((i) => i.id === activeIdStr);
            const overIndex = prev.findIndex((i) => i.id === overIdStr);

            if (!isOverColumn && activeIndex !== -1 && overIndex !== -1) {
                const activeItem = prev[activeIndex];
                const overItem = prev[overIndex];
                if (activeItem.status !== overItem.status) {
                    const newStatus = overItem.status;
                    updateProductionItem(activeItem.id, { status: newStatus });
                    const newItems = [...prev];
                    newItems[activeIndex] = { ...activeItem, status: newStatus };
                    return arrayMove(newItems, activeIndex, overIndex);
                }
                return arrayMove(prev, activeIndex, overIndex);
            }

            if (isOverColumn && activeIndex !== -1) {
                const activeItem = prev[activeIndex];
                const overStatus = overIdStr as Status;
                if (activeItem.status !== overStatus) {
                    updateProductionItem(activeItem.id, { status: overStatus });
                    const newItems = [...prev];
                    newItems[activeIndex] = { ...activeItem, status: overStatus };
                    return newItems;
                }
            }

            return prev;
        });
    };

    const handleDelete = async (id: string) => {
        const success = await deleteProduct(id);
        if (success) setItems((prev) => prev.filter((item) => item.id !== id));
        else alert("Failed to delete product");
    };

    const activeItem = activeId ? items.find((item) => item.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* Board shell – slightly darker bg for depth */}
            <div className="relative rounded-2xl bg-zinc-950/60 dark:bg-zinc-950/80 p-3 border border-border/20">

                {/* ← Prev arrow */}
                <button
                    onClick={() => scrollBy(-1)}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Scroll container */}
                <div
                    ref={scrollRef}
                    onWheel={handleWheel}
                    className="flex gap-3 overflow-x-auto scrollbar-hide px-8 pb-2 pt-1"
                    style={{ cursor: activeId ? "grabbing" : "default" }}
                >
                    {STATUS_COLUMNS.map((status) => (
                        <div key={status} style={{ minWidth: COLUMN_WIDTH, maxWidth: COLUMN_WIDTH }} className="flex-none">
                            <KanbanColumn
                                status={status}
                                title={t(status.replace('/', '_').replace(' ', '_'))}
                                items={items.filter((item) => item.status === status)}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>

                {/* → Next arrow */}
                <button
                    onClick={() => scrollBy(1)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted transition-all"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <DragOverlay>
                {activeItem ? <ItemCard item={activeItem} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
}
