// components/MobileDrawer.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "lucide-react";
import React from "react";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
export function MobileDrawer({ open, onClose, children }: MobileDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex">
          <motion.div
            initial={{ x: -310 }}
            animate={{ x: 0 }}
            exit={{ x: -310 }}
            transition={{ type: "tween", duration: 0.32 }}
            className="bg-white w-[85vw] max-w-xs h-full flex flex-col p-5 relative shadow-xl"
          >
            <button
              className="absolute top-3 right-3 p-2 rounded hover:bg-gray-100"
              onClick={onClose}
              aria-label="Close menu"
            >
              <XIcon className="w-6 h-6" />
            </button>
            {children}
          </motion.div>
          <div className="flex-1" onClick={onClose} />
        </div>
      )}
    </AnimatePresence>
  );
}
