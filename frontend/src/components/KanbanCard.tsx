'use client'
import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {  Badge, Clock, GripVertical, Paperclip } from "lucide-react";
import {   Tooltip,
  TooltipContent,
  TooltipTrigger, } from "@/components/ui/tooltip";
import { CardDetailModal } from "./CardDetailModal";
import {Card as CardType} from "../types/index"
import { attachmentApi, tagApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";

interface CardData {
  id: string;
  title: string;
  description: string | null;
  dueDate:Date|null;
}

interface KanbanCardProps {
  card: CardData;
  boardId: string;
}

export function KanbanCard({ card, boardId }: KanbanCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
const [cardTags, setCardTags] = useState<any[]>([]);
const [attachmentCount, setAttachmentCount] = useState(0);


useEffect(() => {
  const fetchAttachments = async () => {
    try {
      const res = await attachmentApi.getCardAttachments(card.id);
      setAttachmentCount(res.data.attachments.length);
    } catch (error) {
      console.error('Failed to fetch attachments');
    }
  };
  fetchAttachments();
}, [card.id]);


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
  useEffect(() => {
  // Fetch tags for this card
  const fetchTags = async () => {
    try {
      const res = await tagApi.getCardTags(card.id);
      setCardTags(res.data.tags);
    } catch (error) {
      console.error('Failed to fetch card tags');
    }
  };
  fetchTags();
}, [card.id]);


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

              {cardTags.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {cardTags.map(tag => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.color }}
            className="text-white px-2 py-0.5 text-xs"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    )}

    {card.dueDate && (
      <div className="flex items-center gap-1">
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
            isPast(new Date(card.dueDate)) && !isToday(new Date(card.dueDate))
              ? "bg-red-100 text-red-700"
              : isToday(new Date(card.dueDate))
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
          )}
        >
          <Clock className="h-3 w-3" />
          <span>{format(new Date(card.dueDate), "MMM d")}</span>
        </div>
      </div>
    )}
    
    {attachmentCount > 0 && (
  <div className="flex items-center gap-1 text-xs text-gray-500">
    <Paperclip className="h-3 w-3" />
    <span>{attachmentCount}</span>
  </div>
)}
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
        onUpdate={(id, data) => console.log("Update", id, data)}
      />
    </>
  );
}
