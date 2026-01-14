"use client";
import { useEffect, useState } from "react";
import { useAuthRedirect } from "@/lib/useAuthRedirect";
import { useBoardsStore } from "@/store/boards";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { CreateBoardDialog } from "@/components/createBoardDialog";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/AppLayout";
import { BoardSearch } from "@/components/BoardSearch";
import { MobileSidebar } from "@/components/MobileSidebar";
import { UserNav } from "@/components/UserNav";
import { MobileSearch } from "@/components/MobileSearch"; 

export default function DashboardPage() {
  useAuthRedirect();

  const boards = useBoardsStore((s) => s.boards);
  const loading = useBoardsStore((s) => s.loading);
  const fetchBoards = useBoardsStore((s) => s.fetchBoards);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleSelectBoard = (board: any) => {
    router.push(`/boards/${board.id}`);
  };

  return (
    <AppLayout>
      <header className="h-16 bg-white border-b px-4 sm:px-6 flex items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="sm:hidden">
            <MobileSidebar />
          </div>
          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Dashboard</h1>
          <h1 className="text-xl font-bold text-gray-900 sm:hidden">FlowDeck</h1>
        </div>

        <div className="flex-[2] max-w-md justify-center hidden sm:flex">
          <BoardSearch
            boards={boards}
            onSelectBoard={handleSelectBoard}
            dropdownMode="absolute"
            inputClass="bg-gray-100/50 border-transparent focus:bg-white focus:border-blue-200 transition-all h-9 w-full min-w-[300px]"
            containerClass="w-full max-w-md"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
          <MobileSearch boards={boards} onSelectBoard={handleSelectBoard} />

          <Button
            size="sm"
            type="button"
            onClick={() => setShowCreateDialog(true)}
            className="hidden sm:inline-flex cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            <span>New Board</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowCreateDialog(true)}
            className="sm:hidden text-blue-600"
          >
            <PlusIcon className="w-5 h-5" />
          </Button>

          {/* User profile dropdown */}
          <UserNav />
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[140px] w-full rounded-xl" />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                <PlusIcon className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No boards created</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto mt-2">
                Create your first board to start organizing your tasks and projects efficiently.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>Create Board</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <Card
                  key={board.id}
                  className="cursor-pointer rounded-sm hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-blue-300 group"
                  onClick={() => router.push(`/boards/${board.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="group-hover:text-blue-600 transition-colors">
                      {board.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {board.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        <CreateBoardDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      </main>
    </AppLayout>
  );
}
