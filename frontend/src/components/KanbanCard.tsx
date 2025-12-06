'use client'
import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CardDetailDialog } from "./CardDetailDialog";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal, GripVertical } from "lucide-react";
import {   Tooltip,
  TooltipContent,
  TooltipTrigger, } from "@/components/ui/tooltip";
import { CardDetailModal } from "./CardDetailModal";
import {Card as CardType} from "../types/index"
interface CardData {
  id: string;
  title: string;
  description: string | null;
}

interface KanbanCardProps {
  card: CardData;
  boardId: string;
}

export function KanbanCard({ card, boardId }: KanbanCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);


  // Use ref for pointer tracking
  const pointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({
    id: card.id,
    transition: {
      duration: 250,
      easing: "cubic-bezier(.2,1,.22,1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 0.25s cubic-bezier(.18,.89,.32,1.28)",
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : isSorting ? 10 : undefined,
    boxShadow: isDragging || isSorting
      ? "0 8px 24px 0 rgba(0,0,0,0.18)"
      : "0 1px 3px 0 rgba(0,0,0,0.10)",
    border: isDragging ? "2px solid #2563eb" : "1px solid #f3f4f6",
    background: "white",
    cursor: "grab",
  };

  function handlePointerDown(e: React.PointerEvent) {
    pointerDownRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
  }
  function handlePointerUp(e: React.PointerEvent) {
    if (pointerDownRef.current) {
      const dx = Math.abs(e.clientX - startXRef.current);
      const dy = Math.abs(e.clientY - startYRef.current);
      // threshold for drag vs click, adjust as needed
      if (dx < 5 && dy < 5) {
        setShowDetail(true); // it's a click
                setSelectedCard(card as CardType); 

      }
      pointerDownRef.current = false;
    }
  }

  return (
    <>
    <div
             ref={setNodeRef}
        style={style}
        {...attributes}
        >
              <Tooltip>
      <TooltipTrigger asChild>
      <Card

        className={`cursor-pointer transition-shadow rounded-sm p-0 select-none bg-gray-50! border! hover:border-black!`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <CardHeader className="p-3 flex justify-between items-center" >
          
          <div className="flex flex-col gap-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          {/* {card.description && (
            <CardDescription className="text-xs line-clamp-2">
              {card.description}
            </CardDescription>
          )} */}
          </div>
          
                        <Tooltip>
      <TooltipTrigger asChild>
            <div {...listeners} className="ml-2 p-1 cursor-grab hover:bg-gray-300 transition-all duration-200 h-full" aria-label="Drag card">
              <GripVertical className="w- h-6 p-0" />
            </div>
            </TooltipTrigger>
                        <TooltipContent>
              <p>                Drag Card
</p>
              </TooltipContent>

            </Tooltip>
            
        </CardHeader>
      </Card>
      </TooltipTrigger>
            <TooltipContent>
              <p>                Card Details
</p>
              </TooltipContent>

      </Tooltip>
    </div>
      
      {/* <CardDetailDialog
        open={showDetail}
        onOpenChange={setShowDetail}
        card={card}
      /> */}
      <CardDetailModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        boardId={boardId}
        onUpdate={(id, data) => console.log("Update", id, data)}
      />
    </>
  );
}
