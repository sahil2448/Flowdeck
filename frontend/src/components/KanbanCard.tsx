"use client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { CardDetailDialog } from "./CardDetailDialog";

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

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow rounded-sm p-0"
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
