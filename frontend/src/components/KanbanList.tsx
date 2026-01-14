"use client";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, MoreVertical, Trash2, GripVertical } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { CreateCardDialog } from "./CreateCardDialog";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { RenameListDialog } from "./RenameListDialog";
import { DeleteListDialog } from "./DeleteListDialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { VscEmptyWindow } from "react-icons/vsc";

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
  dragHandleProps?: any; // Passed from SortableKanbanList
}

export function KanbanList({ list, activeCardId, dragHandleProps }: KanbanListProps) {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const cards = list.cards || [];
  const { setNodeRef, isOver } = useDroppable({ id: list.id });
  const insertIndex = isOver && activeCardId ? cards.length : -1;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
 <Tooltip>
      <TooltipTrigger asChild>
             <Button
                variant="ghost"
                size="icon"
                className="p-1 cursor-grab"
                {...(dragHandleProps || {})}
              >
                <GripVertical size={18} />
                              </Button>

            </TooltipTrigger>
                        <TooltipContent>
              <p>                Drag List
</p>
              </TooltipContent>

            </Tooltip>



              <h3 className="font-semibold text-lg">{list.title}</h3>
            </div>
            <div className="flex items-center gap-2 relative">
              <span className="text-sm text-gray-500">{cards.length}</span>
              <Tooltip>
      <TooltipTrigger asChild>
         <Button
                size="icon"
                variant="ghost"
                className="p-1 cursor-pointer"
                onClick={() => setMenuOpen(v => !v)}
                aria-label="More options"
              >
                <MoreVertical size={18} />
              </Button>
      </TooltipTrigger>
      <TooltipContent>
              <p>More options</p>
              </TooltipContent>
          <TooltipTrigger/>

              </Tooltip>
             
              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-8 z-30 bg-white border rounded shadow p-1 min-w-[120px]"
                >
                  <Button
                    variant="ghost"
                    className="w-full mb-1 justify-start cursor-pointer"
                    onClick={() => {
                      setShowRename(true);
                      setMenuOpen(false);
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start text-red-600 gap-2 text-white cursor-pointer"
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
          <SortableContext
            id={list.id}
            items={cards.map(card => card.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 min-h-[40px]">
              {cards.length === 0
                ? (isOver && activeCardId ?(<div
                    className="rounded-md bg-blue-100 border-2 border-blue-400 my-2 flex items-center justify-center"
                    style={{
                      height: 48,
                      opacity: 0.75,
                      transition: "all 0.2s",
                    }}
                  >
                    <span className="text-blue-500 text-sm font-medium">Drop here</span>
                  </div>):(
                    <div className="flex flex-col justify-center items-center gap-2 text-gray-500">
                      <div className="text-sm text-gray-500 italic text-center flex items-center justify-center">No cards yet. Add a card to get started!
                      </div>
                      <div>
                      <VscEmptyWindow className="w-6 h-6 mr-2" />
                    </div>
                  </div>)
                  

                  
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
            className="w-full justify-start mt-3 cursor-pointer"
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
