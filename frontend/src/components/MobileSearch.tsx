"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { BoardSearch } from "@/components/BoardSearch";
import { cn } from "@/lib/utils";

interface MobileSearchProps {
  boards: any[];
  onSelectBoard: (b: any) => void;
  triggerClassName?: string;
}

export function MobileSearch({ boards, onSelectBoard, triggerClassName }: MobileSearchProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Keyboard: Ctrl/⌘+K to toggle, Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(s => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Trigger Icon */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("sm:hidden", triggerClassName)}
        aria-label="Open search"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Centered Dialog Popup */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90%] max-w-md rounded-lg p-0 gap-0 sm:max-w-[425px]">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="text-base font-semibold text-left">Search boards</DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <BoardSearch
              boards={boards}
              onSelectBoard={(b) => { onSelectBoard(b); close(); }}
              dropdownMode="block"
              inputClass="h-10 w-full bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
              containerClass="w-full"
            />
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Start typing to find your boards...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
