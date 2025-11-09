"use client";
import { useEffect, useState } from "react";
import { useAuthRedirect } from "@/lib/useAuthRedirect";
import { useBoardsStore } from "@/store/boards";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
// import { CreateBoardDialog } from "@/components/createBoardDialog";
import { CreateBoardDialog } from "@/components/createBoardDialog";

import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { Skeleton } from "@/components/ui/skeleton";
// import { CreateBoardDialog } from "@/components/createBoardDialog";

export default function DashboardPage() {
  useAuthRedirect();
  const boards = useBoardsStore((s) => s.boards);
  const loading = useBoardsStore((s) => s.loading);
  const fetchBoards = useBoardsStore((s) => s.fetchBoards);
  const user = useAuthStore((s) => s.user);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchBoards();
    
  }, [fetchBoards]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">FlowDeck</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name}!</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Boards</h2>
          <Button onClick={() => setShowCreateDialog(true)} className="flex gap-0 cursor-pointer">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Board
          </Button>
        </div>

        {/* Boards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[120px] w-[250px] rounded-xl" />

            ))}

          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No boards yet. Create your first board!</p>
            <Button onClick={() => setShowCreateDialog(true)} className="cursor-pointer" >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <Card
                key={board.id}
                className="cursor-pointer hover:shadow-md transition-shadow rounded-[8px]"
                onClick={() => router.push(`/boards/${board.id}`)}
              >
                <CardHeader>
                  <CardTitle>{board.title}</CardTitle>
                  <CardDescription>
                    {board.description || "No description"}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Board Dialog */}
      <CreateBoardDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
