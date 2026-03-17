"use client";

import { useState } from "react";
import { ProductionItem, Status } from "@/types";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
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
import { updateProductionItem } from "@/lib/mockData";

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
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
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

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        setItems((prev) => {
            const isOverColumn = STATUS_COLUMNS.includes(overId as Status);
            const activeIndex = prev.findIndex((i) => i.id === activeId);
            const overIndex = prev.findIndex((i) => i.id === overId);

            // Dropping onto another item
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

            // Dropping into an empty column area
            if (isOverColumn && activeIndex !== -1) {
                const activeItem = prev[activeIndex];
                const overStatus = overId as Status;

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

    const activeItem = activeId ? items.find((item) => item.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="relative w-full h-full min-h-[500px]">
                <motion.div 
                    className="flex gap-4 pb-4 h-full cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ right: 0, left: -(STATUS_COLUMNS.length * 336) + (typeof window !== 'undefined' ? window.innerWidth : 1200) - 100 }}
                    dragElastic={0.1}
                    dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                >
                    {STATUS_COLUMNS.map((status) => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            title={t(status.replace('/', '_').replace(' ', '_'))} // matching translation keys
                            items={items.filter((item) => item.status === status)}
                        />
                    ))}
                </motion.div>
            </div>

            <DragOverlay>
                {activeItem ? <ItemCard item={activeItem} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
}
