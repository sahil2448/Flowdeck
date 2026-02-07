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

interface DeleteCommentDialogProps {
  open: boolean;
  cardId: string;
  commentId: string;
    onOpenChange: (open: boolean) => void;
}

export function CommentDeleteDialog({ open, cardId, commentId, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const deleteComment = useBoardStore((s) => s.deleteComment);

  const handleSubmit = async () => {
    // e.preventDefault();
    // setLoading(true);
    try {
      const response = await deleteComment(cardId, commentId);
      toast.success("Comment deleted successfully");
      console.log(response);
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to delete comment");
    } finally {
      //   setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Comment</DialogTitle>
          <DialogDescription>Are you sure you want to delete this comment?</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
