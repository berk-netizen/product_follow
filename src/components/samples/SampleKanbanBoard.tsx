"use client";

import { useState } from "react";
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
import { SampleKanbanColumn } from "./SampleKanbanColumn";
import { SampleItemCard } from "./SampleItemCard";
import { updateProductionItem, deleteProduct } from "@/lib/mockData";

const SAMPLE_COLUMNS: { status: SampleStatus; title: string; emoji: string; accentColor: string }[] = [
    { status: 'NUMUNE TALEP',              title: 'Requested',       emoji: '📋', accentColor: 'text-sky-400' },
    { status: 'DİKİM AŞAMASINDA',          title: 'In Sewing',       emoji: '🧵', accentColor: 'text-amber-400' },
    { status: 'MÜŞTERİYE GÖNDERİLDİ',     title: 'Sent to Client',  emoji: '📦', accentColor: 'text-blue-400' },
    { status: 'REVİZE İSTENDİ',            title: 'Revision Needed', emoji: '✏️', accentColor: 'text-rose-400' },
    { status: 'ONAYLANDI / ÜRETİME HAZIR', title: 'Approved',        emoji: '✅', accentColor: 'text-emerald-400' },
];

interface SampleKanbanBoardProps {
    initialItems: ProductionItem[];
}

export default function SampleKanbanBoard({ initialItems }: SampleKanbanBoardProps) {
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
        else alert("Failed to delete sample.");
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
            {/* Board background: Zinc-950 */}
            <div
                className="w-full rounded-2xl"
                style={{ background: '#09090b', padding: '12px 12px 32px 12px' }}
            >
                <div
                    className="flex gap-6 overflow-x-auto scrollbar-hide"
                    style={{ paddingBottom: '8px' }}
                >
                    {SAMPLE_COLUMNS.map((col) => (
                        <div key={col.status} style={{ minWidth: 320, maxWidth: 350, flex: '0 0 320px' }}>
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
