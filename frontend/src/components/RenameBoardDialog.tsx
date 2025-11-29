"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBoardsStore } from "@/store/boards";
import { toast } from "sonner"; // Assuming you use sonner, or remove if not

interface RenameBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  currentTitle: string;
}

export function RenameBoardDialog({ isOpen, onClose, boardId, currentTitle }: RenameBoardDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const { renameBoard } = useBoardsStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle]);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      await renameBoard(boardId, title);
      onClose();
      toast.success("Board renamed");
    } catch (error) {
      toast.error("Failed to rename board");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Board</DialogTitle>
          <DialogDescription>Enter a new name for your board.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRename}>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Board Title" 
            className="mb-4"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !title.trim()}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
