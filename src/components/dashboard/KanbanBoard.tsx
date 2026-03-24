"use client";

import { useState } from "react";
import { ProductionItem, Status } from "@/types";
import { useTranslations } from "next-intl";
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
            {/* Board background: Zinc-950 */}
            <div
                className="w-full rounded-2xl"
                style={{ background: '#09090b', padding: '12px 12px 32px 12px' }}
            >
                {/* Trello-style simple scroll */}
                <div
                    className="flex gap-6 overflow-x-auto scrollbar-hide"
                    style={{ paddingBottom: '8px' }}
                >
                    {STATUS_COLUMNS.map((status) => (
                        <div key={status} style={{ minWidth: 320, maxWidth: 350, flex: '0 0 320px' }}>
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

            <DragOverlay>
                {activeItem ? <ItemCard item={activeItem} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
}
