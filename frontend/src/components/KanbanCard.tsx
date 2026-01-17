"use client";
import { useEffect, useRef, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, GripVertical, Paperclip } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CardDetailModal } from "./CardDetailModal";
import { Card as CardType } from "../types/index";
import { attachmentApi, tagApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface CardData {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
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
        console.error("Failed to fetch attachments");
      }
    };
    fetchAttachments();
  }, [card.id]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await tagApi.getCardTags(card.id);
        setCardTags(res.data.tags);
      } catch (error) {
        console.error("Failed to fetch card tags");
      }
    };
    fetchTags();
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
    boxShadow: isDragging || isSorting ? "0 8px 24px 0 rgba(0,0,0,0.18)" : "0 1px 3px 0 rgba(0,0,0,0.10)",
    border: isDragging ? "2px solid #2563eb" : "1px solid #e5e7eb",
    background: "white",
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
      if (dx < 5 && dy < 5) {
        setShowDetail(true);
        setSelectedCard(card as CardType);
      }
      pointerDownRef.current = false;
    }
  }

  const hasMetadata = cardTags.length > 0 || card.dueDate || attachmentCount > 0;

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card
          className="cursor-pointer flex justify-center h-fit transition-all p-0 duration-200 rounded-none border border-gray-200 hover:border-gray-600 hover:shadow-md bg-white group overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >

          <div className="px-3 flex items-start justify-between pt-3 h-fit">
            <CardTitle className="text-sm font-medium leading-snug flex-1 self-center flex flex-col gap-2">
              {card.title}

  <div>
     {cardTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 m-0 p-0">
                    {cardTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        style={{ backgroundColor: tag.color }}
                        className="text-white px-2 text-[10px] font-medium rounded shadow-none hover:opacity-90"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}</div>              

            </CardTitle>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  {...listeners}
                  className="shrink-0  rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Drag card"
                >
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Drag to move</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
            <div className="overflow-hidden">
              <div className="px-3 pb-3">
               

                {hasMetadata && (
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    {card.dueDate && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                              isPast(new Date(card.dueDate)) && !isToday(new Date(card.dueDate))
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : isToday(new Date(card.dueDate))
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                : "bg-gray-50 text-gray-700 border border-gray-200"
                            )}
                          >
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(card.dueDate), "MMM d")}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Due {format(new Date(card.dueDate), "PPP")}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {attachmentCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 px-2 py-1 rounded hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                            <Paperclip className="h-3 w-3" />
                            <span className="font-medium">{attachmentCount}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {attachmentCount} attachment{attachmentCount > 1 ? "s" : ""}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <CardDetailModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onUpdate={(id, data) => console.log("Update", id, data)}
      />
    </>
  );
}
