import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function BoardSearch({
  boards,
  onSelectBoard,
  inputClass = "",
  containerClass = "",
  dropdownMode = "auto" // "auto" | "absolute" | "block"
}) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredBoards =
    query
      ? boards.filter((b) =>
          b.title.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  // If mode is auto, use "absolute" on desktop, "block" on mobile based on window width (very naive/but always works)
  let useBlockDropdown = dropdownMode === "block";
  if (dropdownMode === "auto" && typeof window !== "undefined") {
    useBlockDropdown = window.innerWidth < 640; // "sm" breakpoint
  }

  return (
    <div className={`${containerClass || "w-full max-w-xs flex flex-col gap-2"} relative`}>
      <Input
        placeholder="Search boards..."
        value={query}
        className={inputClass || "mb-2 px-3 py-2"}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(!!e.target.value);
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        onFocus={() => setShowDropdown(!!query)}
      />
      {showDropdown && (
        <div
          className={
            useBlockDropdown
              ? "bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-auto flex flex-col z-20"
              : "absolute left-0 top-full w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-auto flex flex-col z-30"
          }
        >
          {filteredBoards.length === 0 ? (
            <div className="text-gray-400 text-center py-4 text-sm">
              No boards found.
            </div>
          ) : (
            filteredBoards.map((board) => (
              <Card
                key={board.id}
                className="flex flex-col p-2 px-3 cursor-pointer rounded-md border-none shadow-none hover:bg-blue-100 active:bg-blue-200 transition mb-[2px]"
                onMouseDown={() => {
                  onSelectBoard?.(board);
                  setShowDropdown(false);
                  setQuery(""); // Optional: clear
                }}
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
