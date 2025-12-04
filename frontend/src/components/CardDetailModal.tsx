"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  AlignLeft, Clock, MessageSquare, Paperclip, Tag, 
  Trash2, User, X, Send
} from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth";
import { useBoardStore } from "@/store/board";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";

interface CardDetailModalProps {
  card: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
  const { user } = useAuthStore();
  const { updateCard, addCommentOptimistic, deleteComment, fetchComments, addComment, comments: allComments } = useBoardStore();
  
  const [title, setTitle] = useState(card?.title || "");
  const [description, setDescription] = useState(card?.description || "");
  const [comment, setComment] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  
  const comments = allComments[card?.id] || [];

  // Socket.io setup for real-time comments
  useEffect(() => {
    if (!isOpen || !card?.id) return;

    const socket = getSocket();
    
    // Join card-specific room
    socket.emit('joinCard', card.id);
    
    // Fetch initial comments
    fetchComments(card.id);

    // Listen for new comments
    socket.on('newComment', (newComment) => {
      if (newComment.cardId === card.id) {
        addComment(card.id, newComment);
      }
    });

    // Listen for deleted comments
    socket.on('commentDeleted', ({ cardId, commentId }) => {
      if (cardId === card.id) {
        useBoardStore.setState((state) => ({
          comments: {
            ...state.comments,
            [cardId]: state.comments[cardId]?.filter((c) => c.id !== commentId) || [],
          },
        }));
      }
    });

    return () => {
      socket.emit('leaveCard', card.id);
      socket.off('newComment');
      socket.off('commentDeleted');
    };
  }, [isOpen, card?.id]);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || "");
    }
  }, [card]);

  const handleTitleBlur = async () => {
    if (title !== card?.title && title.trim()) {
      try {
        await updateCard(card.id, { title });
        toast.success("Title updated");
      } catch (error) {
        setTitle(card.title);
      }
    }
  };

  const handleDescriptionSave = async () => {
    if (description !== card?.description) {
      try {
        await updateCard(card.id, { description });
        toast.success("Description updated");
        setIsEditingDesc(false);
      } catch (error) {
        setDescription(card.description || "");
      }
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    await addCommentOptimistic(card.id, comment);
    setComment("");
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm("Delete this comment?")) {
      await deleteComment(card.id, commentId);
    }
  };

  const handleDeleteCard = () => {
    if (confirm("Are you sure you want to delete this card?")) {
      toast.success("Card deleted");
      onClose();
    }
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        
        {/* Header Section */}
        <div className="px-6 py-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="text-xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-blue-500 rounded-none transition-all" 
                placeholder="Card title"
              />
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <span>in list</span>
                <Badge variant="secondary" className="font-normal">To Do</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <ScrollArea className="flex-1 px-6 py-6">
          <div className="space-y-8 pb-6">
            
            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" /> Members
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Tag className="h-4 w-4" /> Labels
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Clock className="h-4 w-4" /> Due Date
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Paperclip className="h-4 w-4" /> Attach
              </Button>
              <div className="ml-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                  onClick={handleDeleteCard}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>

            <Separator />

            {/* Description Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlignLeft className="h-5 w-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">Description</h3>
                </div>
                {!isEditingDesc && description && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsEditingDesc(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditingDesc || !description ? (
                <div className="space-y-3">
                  <RichTextEditor 
                    content={description} 
                    onChange={setDescription} 
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleDescriptionSave}>
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setDescription(card.description || "");
                        setIsEditingDesc(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="prose prose-sm max-w-none bg-gray-50 rounded-md p-4 border cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setIsEditingDesc(true)}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}
            </div>

            <Separator />

            {/* Attachments Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Attachments</h3>
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                <Paperclip className="h-8 w-8 mx-auto text-gray-400 group-hover:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500">Drop files here or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">Supports images, PDFs, and documents</p>
              </div>
            </div>

            <Separator />

            {/* Activity / Comments Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Activity</h3>
              </div>
              
              {/* Comment Input */}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                    {user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <form onSubmit={handleSendComment} className="flex-1 space-y-2">
                  <div className="relative">
                    <Input 
                      placeholder="Write a comment..." 
                      className="pr-10 bg-white"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    {comment.trim() && (
                      <Button 
                        type="submit" 
                        size="icon" 
                        className="absolute right-1 top-1 h-7 w-7"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </form>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3 group">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-xs">
                        {c.userName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">{c.userName}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(c.createdAt), "MMM d 'at' h:mm a")}
                        </span>
                      </div>
                      <div className="bg-white border rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm">
                        {c.text}
                      </div>
                      <div className="flex gap-3 mt-1">
                        <button 
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-xs text-gray-500 hover:text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
