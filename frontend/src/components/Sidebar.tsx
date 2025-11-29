"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Ensure you have this utils file from shadcn
import { useSidebar } from "@/store/use-sidebar"; // The file created in Step 1
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  Settings, 
  Plus, 
  KanbanSquare, 
  ChevronLeft, 
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { useBoardsStore } from "@/store/boards"; // Using your existing store
import { useAuthStore } from "@/store/auth"; // Using your existing store
import { useEffect } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();
  const { boards, fetchBoards } = useBoardsStore();
  const { user, logout } = useAuthStore();

  // Fetch boards for the "Recent" list
  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // Define routes
  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings", // Placeholder
      active: pathname === "/settings",
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r bg-white transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-[70px]",
        className
      )}
    >
      {/* Header / Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <div className={cn("flex items-center gap-2 font-bold text-xl overflow-hidden transition-all", !isOpen && "scale-0 w-0")}>
          <span className="text-blue-600">Flow</span>Deck
        </div>
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggle} 
            className={cn("ml-auto", !isOpen && "mx-auto")}
        >
           {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </Button>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {routes.map((route) => (
            <NavItem 
                key={route.href} 
                icon={route.icon} 
                label={route.label} 
                href={route.href} 
                isActive={route.active} 
                isCollapsed={!isOpen} 
            />
          ))}
        </div>

        <Separator className="my-4" />

        {/* Boards Section */}
        <div className="space-y-2">
            {isOpen && (
                <div className="px-2 text-xs font-semibold text-gray-500 uppercase mb-2">
                    Your Boards
                </div>
            )}
            
            {/* Create Board Button (Quick Action) */}
             <Button
                variant="outline"
                className={cn(
                    "w-full justify-start gap-2", 
                    !isOpen && "justify-center px-2"
                )}
                // You can hook this up to your existing Dialog trigger
            >
                <Plus size={18} />
                {isOpen && <span>New Board</span>}
            </Button>

            {/* List of Boards (Dynamic) */}
            <div className="mt-2 space-y-1">
                {boards.slice(0, 5).map((board) => (
                    <NavItem
                        key={board.id}
                        icon={KanbanSquare}
                        label={board.title}
                        href={`/boards/${board.id}`}
                        isActive={pathname === `/boards/${board.id}`}
                        isCollapsed={!isOpen}
                        isBoard
                    />
                ))}
            </div>
        </div>
      </ScrollArea>

      {/* Footer / User Profile */}
      <div className="p-3 border-t bg-gray-50">
        <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
           <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                {user?.name?.[0] || "U"}
           </div>
           
           {isOpen && (
               <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{user?.name}</span>
                    <span className="text-xs text-gray-500 truncate">{user?.email}</span>
               </div>
           )}
        </div>
        
        <Button 
            variant="ghost" 
            className={cn("w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50", !isOpen && "justify-center")}
            onClick={() => { logout(); window.location.href = "/login"; }}
        >
            <LogOut size={18} className={cn("mr-2", !isOpen && "mr-0")} />
            {isOpen && "Logout"}
        </Button>
      </div>
    </aside>
  );
}

// Helper Component for Individual Items
interface NavItemProps {
    icon: any;
    label: string;
    href: string;
    isActive: boolean;
    isCollapsed: boolean;
    isBoard?: boolean;
}

function NavItem({ icon: Icon, label, href, isActive, isCollapsed, isBoard }: NavItemProps) {
    if (isCollapsed) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Link href={href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn("w-full justify-center h-10 px-2", isActive && "bg-blue-100 text-blue-700")}
                            >
                                <Icon size={20} />
                                <span className="sr-only">{label}</span>
                            </Button>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                        {label}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <Link href={href} className="block w-full">
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
