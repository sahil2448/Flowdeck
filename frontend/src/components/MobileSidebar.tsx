"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sheet when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="sm:hidden p-2 hover:bg-gray-100 rounded-md">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 bg-white">
         {/* Force the Sidebar to be expanded inside the sheet */}
         {/* We wrap it in a div to override the fixed positioning if necessary */}
         <div className="h-full">
             <Sidebar className="w-full h-full border-none" />
         </div>
      </SheetContent>
    </Sheet>
  );
}
