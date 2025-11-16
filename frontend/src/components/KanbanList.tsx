"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { CreateCardDialog } from "./CreateCardDialog";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

interface CardData {
  id: string;
  title: string;
  description: string | null;
  position: number;
}

interface List {
  id: string;
  title: string;
  cards?: CardData[];
}

interface KanbanListProps {
  list: List;
  activeCardId: string | null;
}

export function KanbanList({ list, activeCardId }: KanbanListProps) {
  const [showCreateCard, setShowCreateCard] = useState(false);

  const cards = list.cards || [];
  const { setNodeRef, isOver } = useDroppable({ id: list.id });

  // Compute the drop placeholder index
  // For simple demo: always show at the end of list if dragging over this list
  // (You can upgrade this to "between cards" for pixel-perfect Trello UX as next step)
  const insertIndex = isOver && activeCardId ? cards.length : -1;

  return (
    <>
      <div ref={setNodeRef} className="shrink-0 w-80 ">
        <Card className="p-4">
          {/* List Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{list.title}</h3>
            <span className="text-sm text-gray-500">{cards.length}</span>
          </div>

          <SortableContext
            id={list.id}
            items={cards.map(card => card.id)}
            strategy={verticalListSortingStrategy}
          >
          

            <div className="space-y-3 min-h-[40px]">
  {cards.length === 0
    ? (isOver && activeCardId &&
      <div
        className="rounded-md bg-blue-100 border-2 border-blue-400 my-2 flex items-center justify-center"
        style={{
          height: 48,
          opacity: 0.75,
          transition: "all 0.2s",
        }}
      >
        <span className="text-blue-500 text-sm font-medium">Drop here</span>
      </div>
    )
    : cards.map((card, idx) => (
        <div key={card.id}>
          <KanbanCard card={card} />
          {/* Show placeholder only after the last card if dragging over */}
          {idx === cards.length - 1 && isOver && activeCardId && (
            <div
              className="rounded-md bg-blue-100 border-2 border-blue-400 my-2 flex items-center justify-center"
              style={{
                height: 48,
                opacity: 0.75,
                transition: "all 0.2s",
              }}
            >
              <span className="text-blue-500 text-sm font-medium">Drop here</span>
            </div>
          )}
        </div>
      ))
  }
</div>

            
          </SortableContext>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setShowCreateCard(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </Card>
      </div>
      <CreateCardDialog
        open={showCreateCard}
        onOpenChange={setShowCreateCard}
        listId={list.id}
      />
    </>
  );
}
