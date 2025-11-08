"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { CreateCardDialog } from "./CreateCardDialog";

interface CardData {
  id: string;
  title: string;
  description: string | null;
  position: number;
}

interface List {
  id: string;
  title: string;
  cards?: CardData[]; // ✅ Make cards optional
}

interface KanbanListProps {
  list: List;
}

export function KanbanList({ list }: KanbanListProps) {
  const [showCreateCard, setShowCreateCard] = useState(false);
  
  // ✅ Safely access cards with fallback
  const cards = list.cards || [];

  return (
    <>
      <div className="flex-shrink-0 w-80">
        <Card className="p-4">
          {/* List Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">{list.title}</h3>
            <span className="text-sm text-gray-500">{cards.length}</span>
          </div>

          {/* Cards */}
          <div className="space-y-2 mb-2">
            {cards.length > 0 ? (
              cards
                .sort((a, b) => a.position - b.position)
                .map((card) => (
                  <KanbanCard key={card.id} card={card} />
                ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No cards yet
              </p>
            )}
          </div>

          {/* Add Card Button */}
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
