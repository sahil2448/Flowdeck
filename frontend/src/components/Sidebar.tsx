"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/use-sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  Plus, 
  KanbanSquare, 
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Pencil
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBoardsStore } from "@/store/boards";
import { useEffect, useState } from "react";
import { CreateBoardDialog } from "@/components/createBoardDialog";
import { RenameBoardDialog } from "@/components/RenameBoardDialog";
import { toast } from "sonner";

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ className, isMobile = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Stores
  const { isOpen, toggle } = useSidebar();
  const { boards, fetchBoards, deleteBoard } = useBoardsStore();

  // Local State
  const [isBoardsOpen, setIsBoardsOpen] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [renameData, setRenameData] = useState<{id: string, title: string} | null>(null);

  // On mobile, sidebar is always "expanded" visually inside the drawer
  const showFull = isMobile ? true : isOpen;

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this board?")) {
        await deleteBoard(id);
        toast.success("Board deleted");
        // If currently on that board, go to dashboard
        if (pathname === `/boards/${id}`) {
            router.push("/dashboard");
        }
    }
  };

  const handleRenameOpen = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setRenameData({ id, title });
  };

  const handleLinkClick = () => {
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  return (
    <>
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r transition-all duration-300 ease-in-out",
        !isMobile && (isOpen ? "w-64" : "w-[70px]"),
        isMobile && "w-full border-none",
        className
      )}
    >
      {/* Header: Brand + Collapse Toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b shrink-0">
        <div className={cn("flex items-center gap-2 font-bold text-xl overflow-hidden transition-all", !showFull && "scale-0 w-0")}>
          <span className="text-blue-600">Flow</span>Deck
        </div>
        
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={isMobile ? onCloseMobile : toggle} 
            className={cn("ml-auto", !showFull && "mx-auto")}
        >
           {isMobile ? (
               <X size={20} />
           ) : (
               isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />
           )}
        </Button>
      </div>

      {/* Scrollable Nav Content */}
      <ScrollArea className="flex-1 px-3 py-4">
        
        {/* 1. Main Dashboard Link */}
        <div className="space-y-2">
          <NavItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              href="/dashboard" 
              isActive={pathname === "/dashboard"} 
              isCollapsed={!showFull} 
              onClick={handleLinkClick}
          />
        </div>

        <Separator className="my-4" />

        {/* 2. Boards Section (Collapsible) */}
        <div className="space-y-2 pb-4">
            {showFull ? (
                // Expanded State: Accordion
                <div className="space-y-1">
                    <button 
                        onClick={() => setIsBoardsOpen(!isBoardsOpen)}
                        className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    >
                        <span>Your Boards</span>
                        {isBoardsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {/* Boards List + Create Button */}
                    {isBoardsOpen && (
                        <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 px-2 text-gray-600 hover:text-blue-600 h-9"
                                onClick={() => setShowCreateDialog(true)}
                            >
                                <Plus size={16} />
                                <span>Create Board</span>
                            </Button>

                            {boards.map((board) => (
                                <BoardNavItem
                                    key={board.id}
                                    board={board}
                                    isActive={pathname === `/boards/${board.id}`}
                                    onClick={handleLinkClick}
                                    onDelete={(e) => handleDelete(e, board.id)}
                                    onRename={(e) => handleRenameOpen(e, board.id, board.title)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // Collapsed State: Icons Only
                <div className="flex flex-col gap-2 items-center">
                     {/* Icon to Create Board */}
                     <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setShowCreateDialog(true)}>
                                    <Plus size={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Create Board</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                     
                     <Separator className="w-8" />
                     
                     {/* First few boards as icons */}
                     {boards.slice(0, 5).map((board) => (
                         <NavItem
                            key={board.id}
                            icon={KanbanSquare}
                            label={board.title}
                            href={`/boards/${board.id}`}
                            isActive={pathname === `/boards/${board.id}`}
                            isCollapsed={true}
                            isBoard
                         />
                     ))}
                </div>
            )}
        </div>
      </ScrollArea>
    </aside>

    {/* Dialogs (Rendered here so they work from Sidebar) */}
    <CreateBoardDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
    />

    {renameData && (
        <RenameBoardDialog 
            isOpen={!!renameData}
            onClose={() => setRenameData(null)}
            boardId={renameData.id}
            currentTitle={renameData.title}
        />
    )}
    </>
  );
}

// --- SUB COMPONENTS ---

// 1. Standard Nav Item (Dashboard, etc)
interface NavItemProps {
    icon: any;
    label: string;
    href: string;
    isActive: boolean;
    isCollapsed: boolean;
    isBoard?: boolean;
    onClick?: () => void;
}

function NavItem({ icon: Icon, label, href, isActive, isCollapsed, isBoard, onClick }: NavItemProps) {
    if (isCollapsed) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Link href={href} onClick={onClick}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn("w-full justify-center h-10 px-2", isActive && "bg-blue-100 text-blue-700")}
                            >
                                <Icon size={20} />
                                <span className="sr-only">{label}</span>
                            </Button>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <Link href={href} className="block w-full" onClick={onClick}>
            <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                    "w-full justify-start gap-3 h-10 font-normal",
                    isActive && "bg-blue-50 text-blue-700 font-medium"
                )}
            >
                <Icon size={isBoard ? 18 : 20} className={cn(isBoard && "text-gray-500")} />
                <span className="truncate">{label}</span>
            </Button>
        </Link>
    );
}

// 2. Board Nav Item (With Dropdown Menu for Delete/Rename)
interface BoardNavItemProps {
    board: any;
    isActive: boolean;
    onClick?: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onRename: (e: React.MouseEvent) => void;
}

function BoardNavItem({ board, isActive, onClick, onDelete, onRename }: BoardNavItemProps) {
    return (
        <div className="group relative flex items-center">
            <Link href={`/boards/${board.id}`} className="flex-1 min-w-0" onClick={onClick}>
                <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                        "w-full justify-start gap-3 h-10 font-normal pr-8",
                        isActive && "bg-blue-50 text-blue-700 font-medium"
                    )}
                >
                    <KanbanSquare size={18} className="text-gray-500 shrink-0" />
                    <span className="truncate">{board.title}</span>
                </Button>
            </Link>

            {/* 3 Dots Menu - Appears on Hover */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-gray-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal size={14} />
                            <span className="sr-only">More</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="right">
                        <DropdownMenuItem onClick={onRename}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
