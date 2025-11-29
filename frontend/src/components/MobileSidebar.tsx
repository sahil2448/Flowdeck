"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PanelLeft } from "lucide-react"; // ✅ Switched to Panel icon
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sheet when route changes (backup safety)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {/* ✅ Matches the visual style of the desktop collapse button */}
        <Button variant="ghost" size="icon" className="sm:hidden">
          <PanelLeft className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left"         className="p-0 w-72 bg-white border-r [&>button]:hidden"
>
         {/* Pass isMobile=true so the sidebar knows to behave as a drawer content */}
         <Sidebar 
            isMobile={true} 
            onCloseMobile={() => setIsOpen(false)} 
         />
      </SheetContent>
    </Sheet>
  );
}
