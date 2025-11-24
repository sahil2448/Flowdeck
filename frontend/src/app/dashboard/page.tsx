"use client";
import { useEffect, useState } from "react";
import { useAuthRedirect } from "@/lib/useAuthRedirect";
import { useBoardsStore } from "@/store/boards";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusIcon, MenuIcon } from "lucide-react";
import { CreateBoardDialog } from "@/components/createBoardDialog";
import { BoardSearch } from "@/components/BoardSearch";
import { MobileDrawer } from "@/components/MobileDrawer";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  useAuthRedirect();
  
  const boards = useBoardsStore((s) => s.boards);
  const loading = useBoardsStore((s) => s.loading);
  const fetchBoards = useBoardsStore((s) => s.fetchBoards);
  const user = useAuthStore((s) => s.user);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              type="button"
              className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-900"
              aria-label="Open menu"
              onClick={() => setShowMobileMenu(true)}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FlowDeck</h1>
              <p className="text-sm text-gray-500 truncate">
                Welcome back, {user?.name}!
              </p>
            </div>
          </div>
            {/* Desktop menu */}
          <div className="hidden sm:flex items-center gap-4">
            <BoardSearch boards={boards} onSelectBoard={board => router.push(`/boards/${board.id}`)} dropdownMode="absolute" />
            <LogoutButton />
          </div>
        </div>
        {/* Mobile Menu (Animated) */}
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
  dropdownMode="block"
          />
          <Button
            className="mt-4 w-full flex gap-2"
            onClick={() => {
              setShowMobileMenu(false);
              setShowCreateDialog(true);
            }}
          >
            <PlusIcon className="w-4 h-4" /> Create Board
          </Button>
          <LogoutButton className="mt-4 w-full" />
        </MobileDrawer>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Boards</h2>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex gap-0 cursor-pointer hidden sm:flex"
          >
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
            <p className="text-gray-500 mb-4">
              No boards yet. Create your first board!
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="cursor-pointer"
            >
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
      <CreateBoardDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}

