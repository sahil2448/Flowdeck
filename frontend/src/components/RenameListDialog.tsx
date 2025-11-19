"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useBoardStore } from "@/store/board";
import { toast } from "sonner";
import { useState } from "react";

interface RenameListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  currentTitle: string;
}

export function RenameListDialog({ open, onOpenChange, listId, currentTitle }: RenameListDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);
  const renameList = useBoardStore((s) => s.renameList);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    try {
      await renameList(listId, title);
      toast.success("List renamed!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Rename failed");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename List</DialogTitle>
          <DialogDescription>Change the name of your list</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rename-title">New Title</Label>
              <Input
                id="rename-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
