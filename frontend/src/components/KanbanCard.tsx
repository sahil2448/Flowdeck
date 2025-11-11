"use client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { use, useState } from "react";
import { CardDetailDialog } from "./CardDetailDialog";
import { useSortable, AnimateLayoutChanges, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Recommended AnimateLayoutChanges for best spring smoothness
const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

interface CardData {
  id: string;
  title: string;
  description: string | null;
}

interface KanbanCardProps {
  card: CardData;
}

export function KanbanCard({ card }: KanbanCardProps) {
  const [showDetail, setShowDetail] = useState(false);

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
    transition: transition || 'transform 0.25s cubic-bezier(.18,.89,.32,1.28)',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : isSorting ? 10 : undefined,
    boxShadow: isDragging || isSorting
      ? "0 8px 24px 0 rgba(0,0,0,0.18)"
      : "0 1px 3px 0 rgba(0,0,0,0.10)",
    border: isDragging ? "2px solid #2563eb" : "1px solid #f3f4f6",
    background: "white",
    touchAction: "none",
    cursor: "grab",
    // userSelect: "none",
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`cursor-pointer hover:shadow-md transition-shadow rounded-sm p-0 select-none`}
        onClick={() => setShowDetail(true)}
      >
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          {card.description && (
            <CardDescription className="text-xs line-clamp-2">
              {card.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
      <CardDetailDialog
        open={showDetail}
        onOpenChange={setShowDetail}
        card={card}
      />
    </>
  );
}
