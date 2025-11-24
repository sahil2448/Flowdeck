"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthRedirect } from "@/lib/useAuthRedirect";
import { useBoardStore } from "@/store/board";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PlusIcon, MenuIcon } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { CreateListDialog } from "@/components/CreateListDialog";
import { BoardSearch } from "@/components/BoardSearch";
import { MobileDrawer } from "@/components/MobileDrawer";
import { useBoardsStore } from "@/store/boards";
import { useAuthStore } from "@/store/auth";

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const boards = useBoardsStore((s) => s.boards);
  const fetchBoards = useBoardsStore((s) => s.fetchBoards);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);
  useEffect(() => {
    if (boardId) { fetchBoard(boardId); }
    return () => { reset(); };
  }, [boardId, fetchBoard, reset]);

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
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger for Mobile */}
            <button
              type="button"
              className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-900"
              aria-label="Open menu"
              onClick={() => setShowMobileMenu(true)}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="ml-0"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div className="flex flex-col min-w-0 ml-2">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{board.title}</h1>
              {board.description && (
                <p className="text-sm text-gray-500 truncate">{board.description}</p>
              )}
            </div>
          </div>
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-4">
            <BoardSearch boards={boards} onSelectBoard={board => router.push(`/boards/${board.id}`)} dropdownMode="absolute" />
            <Button onClick={() => setShowCreateList(true)} className="flex gap-1">
              <PlusIcon className="w-4 h-4 mr-2" /> Add List
            </Button>
          </div>
        </div>
        {/* Mobile Animated Drawer */}
        <MobileDrawer open={showMobileMenu} onClose={() => setShowMobileMenu(false)}>
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          <BoardSearch
            boards={boards}
            onSelectBoard={board => {
              setShowMobileMenu(false);
              router.push(`/boards/${board.id}`);
            }}
            inputClass="w-full px-4 py-2 mb-2 border border-gray-200 rounded-md"
            containerClass="w-full flex flex-col gap-2"
          />
          <Button
            className="mt-4 w-full flex gap-2"
            onClick={() => {
              setShowMobileMenu(false);
              setShowCreateList(true);
            }}
          >
            <PlusIcon className="w-4 h-4" /> Add List
          </Button>
          <Button
            className="mt-4 w-full"
            onClick={() => { setShowMobileMenu(false); router.push("/dashboard"); }}
          >
            <ArrowLeftIcon className="w-5 h-5" /> Dashboard
          </Button>
        </MobileDrawer>
      </header>
      {/* Kanban Board */}
      <main className="p-4 sm:p-6 lg:p-8">
        <KanbanBoard board={board} />
      </main>
      <CreateListDialog
        open={showCreateList}
        onOpenChange={setShowCreateList}
        boardId={boardId}
      />
    </div>
  );
}
