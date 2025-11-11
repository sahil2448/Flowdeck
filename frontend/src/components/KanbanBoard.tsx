"use client";
import { useState } from "react";
import { KanbanList } from "./KanbanList";
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { useBoardStore } from "@/store/board";
import { KanbanCard } from "./KanbanCard";

interface Board {
  id: string;
  title: string;
  lists: Array<{
    id: string;
    title: string;
    position: number;
    cards: Array<{
      id: string;
      title: string;
      description: string | null;
      position: number;
    }>;
  }>;
}

interface KanbanBoardProps {
  board: Board;
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const moveCard = useBoardStore((s) => s.moveCard);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  

  function handleDragStart(event: any) {
    setActiveCardId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCardId(null);
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    let sourceListId: string | null = null;
    let targetListId: string | null = null;

    for (const list of board.lists) {
      if (list.cards.find(c => c.id === active.id)) sourceListId = list.id;
      if (list.cards.find(c => c.id === over.id)) targetListId = list.id;
    }
    if (!targetListId) targetListId = over.id as string;

    const targetList = board.lists.find(l => l.id === targetListId);
    let newIndex: number = 0;
    if (targetList) {
      if (targetList.cards.length === 0) {
        newIndex = 0;
      } else {
        const overCardIdx = targetList.cards.findIndex(c => c.id === over.id);
        newIndex = overCardIdx !== -1 ? overCardIdx : targetList.cards.length;
      }
    }

    if (!sourceListId || !targetListId) return;
    moveCard(active.id as string, sourceListId, targetListId, newIndex);
  }

  // Find the active card data for the overlay
  const activeCard = board.lists
    .flatMap(l => l.cards)
    .find(c => c.id === activeCardId) || null;

  if (!board.lists || board.lists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No lists yet. Create your first list!</p>
      </div>
    );
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.lists
          .sort((a, b) => a.position - b.position)
          .map((list) => (
          <KanbanList key={list.id} list={list} activeCardId={activeCardId} />
          ))}
      </div>
      {/* DragOverlay: floating card during drag */}
      <DragOverlay>
        {activeCard ? (
          <div style={{ width: 320, zIndex: 9999 }}>
            <KanbanCard card={activeCard} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
