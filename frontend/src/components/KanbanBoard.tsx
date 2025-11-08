"use client";
import { useState } from "react";
import { KanbanList } from "./KanbanList";

interface Board {
  id: string;
  title: string;
  lists: Array<{
    id: string;
    title: string;
    position: number;
    cards: Array<{
      id: string;
      title: string;
      description: string | null;
      position: number;
    }>;
  }>;
}

interface KanbanBoardProps {
  board: Board;
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  if (!board.lists || board.lists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No lists yet. Create your first list!</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {board.lists
        .sort((a, b) => a.position - b.position)
        .map((list) => (
          <KanbanList key={list.id} list={list} />
        ))}
    </div>
  );
}
