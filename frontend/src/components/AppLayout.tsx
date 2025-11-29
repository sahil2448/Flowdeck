"use client";

import { Sidebar } from "@/components/Sidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { useSidebar } from "@/store/use-sidebar";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden sm:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden transition-all duration-300">
        
        {/* Mobile Header (Only visible on small screens) */}
        <header className="sm:hidden flex items-center px-4 h-16 border-b bg-white shrink-0">
          <MobileSidebar />
          <span className="ml-4 font-bold text-xl">FlowDeck</span>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
