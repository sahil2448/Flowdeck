"use client";

import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden sm:block h-full shrink-0 z-30 relative">
        <Sidebar />
      </div>

      {/* Main Content Area - No Global Header */}
      <div className="flex flex-col flex-1 h-full overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
