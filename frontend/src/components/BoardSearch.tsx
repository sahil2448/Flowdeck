"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Board } from "@/types";

interface BoardSearchProps {
  boards: Board[];
  onSelectBoard?: (board: Board) => void;
}

export function BoardSearch({ boards, onSelectBoard }: BoardSearchProps) {
  const [query, setQuery] = useState("");

  // Case-insensitive filter; only show results if query is non-empty
  const filteredBoards = query
    ? boards.filter((b) =>
        b.title.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-2 absolute top-2 left-1/2 -translate-x-1/2 z-50 p-2 sm:max-w-sm">
      <Input
        placeholder="Search boards..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2 px-3 py-2"
      />
      {/* Dropdown results */}
      {query && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-auto flex flex-col">
          {filteredBoards.length === 0 ? (
            <div className="text-gray-400 text-center py-4 text-sm">
              No boards found.
            </div>
          ) : (
            filteredBoards.map((board) => (
              <Card
                key={board.id}
                className="flex flex-col p-2 px-3 gap-2 cursor-pointer rounded-md border-none shadow-none hover:bg-blue-100 active:bg-blue-200 transition mb-[2px]"
                onClick={() => onSelectBoard?.(board)}
              >
                <div className="font-medium text-sm truncate">{board.title}</div>
                {board.description && (
                  <div className="text-xs text-gray-500 mt-[1px] truncate">
                    {board.description}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
