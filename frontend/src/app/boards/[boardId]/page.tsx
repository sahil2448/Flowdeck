"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthRedirect } from "@/lib/useAuthRedirect";
import { useBoardStore } from "@/store/board";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { CreateListDialog } from "@/components/CreateListDialog";
export default function BoardPage() {
  useAuthRedirect();
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  
  const board = useBoardStore((s) => s.board);
  const loading = useBoardStore((s) => s.loading);
  const fetchBoard = useBoardStore((s) => s.fetchBoard);
  const reset = useBoardStore((s) => s.reset); // ✅ Add reset
  const [showCreateList, setShowCreateList] = useState(false);
  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
    }

    return () => {
      reset();
    };
  }, [boardId, fetchBoard,reset]);
  // ✅ Add this to debug
useEffect(() => {
  if (board) {
    console.log('Board data:', board);
    console.log('Lists:', board.lists);
    board.lists?.forEach((list, i) => {
      console.log(`List ${i} cards:`, list.cards);
    });
  }
}, [board]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading board...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Board not found</p>
          <Button onClick={() => router.push('/dashboard')} className="cursor-pointer">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
                {board.description && (
                  <p className="text-sm text-gray-500">{board.description}</p>
                )}
              </div>
            </div>
            <Button onClick={() => setShowCreateList(true)} className="flex gap-0">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add List
            </Button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="p-4 sm:p-6 lg:p-8">
        <KanbanBoard board={board} />
      </main>

      {/* Create List Dialog */}
      <CreateListDialog
        open={showCreateList}
        onOpenChange={setShowCreateList}
        boardId={boardId}
      />
    </div>
  );
}