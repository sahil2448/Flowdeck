"use client";
import { useState,useEffect,useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, MoreVertical, Trash2 } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { CreateCardDialog } from "./CreateCardDialog";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useBoardStore } from "@/store/board";
import { RenameListDialog } from "./RenameListDialog";
import { DeleteListDialog } from "./DeleteListDialog";

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
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState(list.title);
  const [showDelete, setShowDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const renameList = useBoardStore((s) => s.renameList);
  const deleteList = useBoardStore((s) => s.deleteList);

  const cards = list.cards || [];
  const { setNodeRef, isOver } = useDroppable({ id: list.id });
  const insertIndex = isOver && activeCardId ? cards.length : -1;


  const menuRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!menuOpen) return;
  function handleClick(e: MouseEvent) {
    // If click target is outside the dropdown, close menu
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target as Node)
    ) {
      setMenuOpen(false);
    }
  }
  document.addEventListener("mousedown", handleClick);
  return () => document.removeEventListener("mousedown", handleClick);
}, [menuOpen]);


  return (
    <>
      <div ref={setNodeRef} className="flex-shrink-0 w-80">
        <Card className="p-4">
          {/* Header with actions */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{list.title}</h3>
            <div className="flex items-center gap-2 relative">
              <span className="text-sm text-gray-500">{cards.length}</span>
              <Button
  size="icon"
  variant="ghost"
  className="p-1"
  onClick={() => setMenuOpen(v => !v)}
  aria-label="More options"
>
  <MoreVertical size={18} />
</Button>
{menuOpen && (
  <div
    ref={menuRef}
    className="absolute right-0 top-8 z-30 bg-white border rounded shadow p-1 min-w-[120px]"
  >
    <Button
      variant="ghost"
      className="w-full mb-1 justify-start"
      onClick={() => {
        setShowRename(true);
        setMenuOpen(false);
      }}
    >
      Rename
    </Button>
    <Button
      variant="destructive"
      className="w-full justify-start text-red-600 gap-2 text-white"
      onClick={() => {
        setShowDelete(true);
        setMenuOpen(false);
      }}
    >
      <Trash2 size={16} /> Delete
    </Button>
  </div>
)}

            </div>
          </div>

          {/* Sortable cards */}
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
            className="w-full justify-start mt-3"
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

      <RenameListDialog
  open={showRename}
  onOpenChange={setShowRename}
  listId={list.id}
  currentTitle={list.title}
/>
<DeleteListDialog
  open={showDelete}
  onOpenChange={setShowDelete}
  listId={list.id}
/>



    </>
  );
}
