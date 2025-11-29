"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthRedirect } from "@/lib/useAuthRedirect";
import { useBoardStore } from "@/store/board";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { CreateListDialog } from "@/components/CreateListDialog";
import { useBoardsStore } from "@/store/boards";
import AppLayout from "@/components/AppLayout";
import { BoardSearch } from "@/components/BoardSearch";
import { MobileSidebar } from "@/components/MobileSidebar";
import { UserNav } from "@/components/UserNav";

export default function BoardPage() {
  useAuthRedirect();
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;

  const board = useBoardStore((s) => s.board);
  const loading = useBoardStore((s) => s.loading);
  const fetchBoard = useBoardStore((s) => s.fetchBoard);
  const reset = useBoardStore((s) => s.reset);
  const [showCreateList, setShowCreateList] = useState(false);

  // For Search
  const { boards, fetchBoards } = useBoardsStore();

  useEffect(() => { fetchBoards(); }, [fetchBoards]);
  
  useEffect(() => {
    if (boardId) { fetchBoard(boardId); }
    return () => { reset(); };
  }, [boardId, fetchBoard, reset]);

  const handleSelectBoard = (b: any) => {
    router.push(`/boards/${b.id}`);
  };

  if (loading || !board) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
             {/* Simple loading spinner */}
             <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-gray-100/50">
        
        {/* ✅ BOARD HEADER */}
        <header className="h-16 bg-white border-b px-4 sm:px-6 flex items-center justify-between shrink-0 gap-4">
            
            {/* Left: Mobile Trigger + Board Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="sm:hidden">
                    <MobileSidebar />
                </div>
                <div className="flex flex-col min-w-0">
                    <h1 className="text-lg font-bold text-gray-900 truncate leading-tight">
                        {board.title}
                    </h1>
                    {/* Optional: Breadcrumb or description */}
                    {/* <span className="text-xs text-gray-500 hidden sm:block">Project Board</span> */}
                </div>
            </div>

            {/* Center: Search */}
            <div className="flex-[2] max-w-md flex justify-center">
                <BoardSearch 
                    boards={boards}
                    onSelectBoard={handleSelectBoard}
                    dropdownMode="absolute"
                    inputClass="bg-gray-100/50 border-transparent focus:bg-white focus:border-blue-200 transition-all h-9 w-full min-w-[200px] sm:min-w-[300px]"
                    containerClass="w-full max-w-md hidden sm:flex" // Hide search on tiny screens if needed, or keep
                />
            </div>

            {/* Right: Add List + User */}
            <div className="flex items-center gap-3 flex-1 justify-end">
                <Button 
                    size="sm" 
                    onClick={() => setShowCreateList(true)} 
                    // className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                    <PlusIcon className="w-4 h-4 sm:mr-2" /> 
                    <span className="hidden sm:inline">Add List</span>
                </Button>
                <UserNav />
            </div>
        </header>

        {/* Kanban Board Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <KanbanBoard board={board} />
        </div>

        <CreateListDialog
          open={showCreateList}
          onOpenChange={setShowCreateList}
          boardId={boardId}
        />
      </div>
    </AppLayout>
  );
}
