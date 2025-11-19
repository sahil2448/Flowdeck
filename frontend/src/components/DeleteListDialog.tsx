"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBoardStore } from "@/store/board";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
}

export function DeleteListDialog({ open, onOpenChange, listId }: DeleteListDialogProps) {
  const [loading, setLoading] = useState(false);
  const deleteList = useBoardStore((s) => s.deleteList);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteList(listId);
      toast.success("List deleted!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <Trash2 size={18} />
            Delete List?
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. All cards in this list will also be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? "Deleting..." : (
              <span className="flex gap-1 items-center">
                <Trash2 size={16} /> Delete
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
