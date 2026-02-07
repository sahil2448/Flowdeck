"use client";
import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { KanbanList } from "./KanbanList";
import { useBoardStore } from "@/store/board";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { KanbanCard } from "./KanbanCard";
import { CSS } from "@dnd-kit/utilities";
import { Board } from "@/store/board";


interface KanbanBoardProps {
  board: Board;
  boardId: string;
}


function SortableKanbanList({ list, activeCardId,boardId }: { list: any; activeCardId: string | null }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: list.id, data: { type: "list" } });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
        zIndex: isDragging ? 100 : undefined,
      }}
      className="mr-4"
    >
      <KanbanList
        list={list}
        boardId={boardId}
        activeCardId={activeCardId}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export function KanbanBoard({ board, boardId }: KanbanBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const moveCard = useBoardStore((s) => s.moveCard);
  const moveList = useBoardStore((s) => s.moveList);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  function handleDragStart(event: any) {
    if (event.active.data.current?.type === "list") {
      // List drag visual
    } else {
      setActiveCardId(event.active.id);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCardId(null);
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    // List reordering
    if (active.data.current?.type === "list" && over.id) {
      const oldIndex = board.lists.findIndex(l => l.id === active.id);
      const newIndex = board.lists.findIndex(l => l.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        moveList(active.id, newIndex);
      }
      return;
    }

    // Card moving
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

  const activeCard = board.lists.flatMap(l => l.cards).find(c => c.id === activeCardId) || null;
  const sortedLists = board.lists?.slice().sort((a, b) => a.position - b.position);

  if (!board.lists || board.lists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No lists yet. Create your first list!</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedLists.map(list => list.id)}
        strategy={horizontalListSortingStrategy}
      >
        <ScrollArea className="w-full">
          <div className="flex gap-4 overflow-x-auto pb-4 min-h-[80vh]">
            {sortedLists.map(list => (
              <SortableKanbanList key={list.id} list={list} activeCardId={activeCardId} boardId={boardId} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="mb-4 bg-black" />
        </ScrollArea>
      </SortableContext>
      <DragOverlay>
        {activeCard ? (
          <div style={{ width: 320, zIndex: 9999 }}>
            <KanbanCard boardId={boardId} card={activeCard} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
