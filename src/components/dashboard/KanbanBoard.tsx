"use client";

import { useState, useCallback } from "react";
import { ProductionItem, Status } from "@/types";
import { useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
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

interface KanbanBoardProps {
    initialItems: ProductionItem[];
}

export default function KanbanBoard({ initialItems }: KanbanBoardProps) {
    const t = useTranslations("Status");
    const [items, setItems] = useState<ProductionItem[]>(initialItems);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Embla Carousel - dragFree for smooth momentum, contained scroll
    const [emblaRef, emblaApi] = useEmblaCarousel({
        dragFree: true,
        containScroll: "trimSnaps",
        align: "start",
    });

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    // DnD sensors - distance:8 prevents carousel drag conflicts
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeIdStr = active.id;
        const overIdStr = over.id;

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
        if (success) {
            setItems((prev) => prev.filter((item) => item.id !== id));
        } else {
            alert("Failed to delete product");
        }
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
                {/* Prev Button */}
                <button
                    onClick={scrollPrev}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Embla Viewport */}
                <div className="overflow-hidden mx-6" ref={emblaRef}>
                    <div className="flex gap-4 pb-4">
                        {STATUS_COLUMNS.map((status) => (
                            <div key={status} className="flex-none w-[300px]">
                                <KanbanColumn
                                    status={status}
                                    title={t(status.replace('/', '_').replace(' ', '_'))}
                                    items={items.filter((item) => item.status === status)}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next Button */}
                <button
                    onClick={scrollNext}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted transition-all"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-1.5 mt-3">
                {STATUS_COLUMNS.map((status, i) => (
                    <button
                        key={status}
                        onClick={() => emblaApi?.scrollTo(i)}
                        className={`h-1.5 rounded-full transition-all ${
                            i === selectedIndex
                                ? "w-4 bg-emerald-500"
                                : "w-1.5 bg-zinc-600 hover:bg-zinc-400"
                        }`}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeItem ? <ItemCard item={activeItem} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
}
