"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  AlignLeft, Clock, MessageSquare, Paperclip, Tag, 
   User, X, Send, Check, TrashIcon
} from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth";
import { useBoardStore } from "@/store/board";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";
import {  attachmentApi, memberApi, tagApi } from "@/lib/api";
import { MemberSelector } from "./MemberSelector";
import { TagSelector } from "./TagSelector";
import { DueDatePicker } from "./DueDatePicker";
import { AttachmentUploader } from "./attachmentUploader";
import {CommentDeleteDialog} from "./CommentDeleteDialog"

interface CardDetailModalProps {
  card: any;
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
  const { user } = useAuthStore();
  const { 
    updateCard, 
    addCommentOptimistic, 
    deleteComment, 
    fetchComments, 
    addComment, 
    deleteCard, 
    comments: allComments 
  } = useBoardStore();
  const [title, setTitle] = useState(card?.title || "");
  const [description, setDescription] = useState(card?.description || "");
  const [comment, setComment] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dis, setDis] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [boardId, setBoardId] = useState<string>();
  const [tags, setTags] = useState<any[]>([]);
  const [dueDate, setDueDate] = useState<Date | null>(card?.dueDate || null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  const comments = allComments[card?.id] || [];

  const handleAttachmentAdded = useCallback((attachment: any) => {
    if (!attachment || !attachment.id) {
      console.warn('Invalid attachment received:', attachment);
      return;
    }
    
    setAttachments(prev => {
      if (prev.some(a => a.id === attachment.id)) {
        console.log('Duplicate attachment prevented:', attachment.id);
        return prev;
      }
      console.log('Adding attachment:', attachment);
      return [attachment, ...prev];
    });
  }, []);

  const handleAttachmentDeleted = useCallback((attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  }, []);

  const fetchCardAttachments = useCallback(async () => {
    if (!card?.id) return;
    
    try {
      const res = await attachmentApi.getCardAttachments(card.id);
      console.log('Fetched attachments:', res.data.attachments);
      setAttachments(res.data.attachments || []);
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
    }
  }, [card?.id]);

  useEffect(() => {
    if (!isOpen || !card?.id) return;

    const socket = getSocket();
    
    const handleSocketAttachmentAdded = ({ cardId, attachment }: any) => {
      if (cardId === card.id) {
        handleAttachmentAdded(attachment);
      }
    };

    const handleSocketAttachmentDeleted = ({ cardId, attachmentId }: any) => {
      if (cardId === card.id) {
        handleAttachmentDeleted(attachmentId);
      }
    };

    socket.on('attachmentAdded', handleSocketAttachmentAdded);
    socket.on('attachmentDeleted', handleSocketAttachmentDeleted);

    return () => {
      socket.off('attachmentAdded', handleSocketAttachmentAdded);
      socket.off('attachmentDeleted', handleSocketAttachmentDeleted);
    };
  }, [isOpen, card?.id, handleAttachmentAdded, handleAttachmentDeleted]);

  const handleDueDateUpdate = async (newDueDate: Date | null) => {
    try {
      await updateCard(card.id, { dueDate: newDueDate });
      setDueDate(newDueDate);
      toast.success("Due date updated");
    } catch (error) {
      toast.error("Failed to update due date");
    }
  };

  useEffect(() => {
    if (!isOpen || !card?.id) return;

    const socket = getSocket();
    
    const handleCardUpdated = ({ card: updatedCard }: any) => {
      if (updatedCard.id === card.id) {
        setDueDate(updatedCard.dueDate || null);
      }
    };

    socket.on('cardUpdated', handleCardUpdated);

    return () => {
      socket.off('cardUpdated', handleCardUpdated);
    };
  }, [isOpen, card?.id]);

  useEffect(() => {
    const fetchBoardId = async () => {
      if (!card?.listId) return;

      const listId = card.listId;

      try {
        const list = await useBoardStore.getState().getListsById(listId); 
        setBoardId(list?.boardId);
      } catch (err) {
        console.error("Error fetching list:", err);
      }
    };

    fetchBoardId();
  }, [card]);

  const fetchBoardMembers = useCallback(async () => {
    if (!boardId) {
      console.warn('Missing board ID');
      return;
    }
    try {
      const res = await memberApi.getBoardMembers(boardId);
      console.log('Board members:', res.data.members);
    } catch (error) {
      console.error('Failed to fetch board members:', error);
      toast.error('Failed to load board members');
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoardMembers();
  }, [fetchBoardMembers]);

  const fetchCardMembers = useCallback(async () => {
    if (!card?.id || !boardId) {
      console.warn('Missing card ID or board ID');
      return;
    }
    try {
      const res = await memberApi.getCardMembers(card.id);
      setMembers(res.data.members);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast.error('Failed to load card members');
    }
  }, [card?.id, boardId]);

  useEffect(() => {
    if (!isOpen || !card?.id) return;

    const socket = getSocket();
    
    const handleMemberAdded = ({ cardId, member }: any) => {
      if (cardId === card.id) {
        setMembers(prev => {
          if (prev.some(m => m.id === member.id)) return prev;
          return [...prev, member];
        });
      }
    };

    const handleMemberRemoved = ({ cardId, userId }: any) => {
      if (cardId === card.id) {
        setMembers(prev => prev.filter(m => m.id !== userId));
      }
    };

    socket.on('memberAdded', handleMemberAdded);
    socket.on('memberRemoved', handleMemberRemoved);

    return () => {
      socket.off('memberAdded', handleMemberAdded);
      socket.off('memberRemoved', handleMemberRemoved);
    };
  }, [isOpen, card?.id]);

  const fetchCardTags = useCallback(async () => {
    if (!card?.id || !boardId) return;
    
    try {
      const res = await tagApi.getCardTags(card.id);
      setTags(res.data.tags);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  }, [card?.id, boardId]);

  useEffect(() => {
    if (!isOpen || !card?.id) return;

    const socket = getSocket();
    
    const handleTagAdded = ({ cardId, tag }: any) => {
      if (cardId === card.id) {
        setTags(prev => {
          if (prev.some(t => t.id === tag.id)) return prev;
          return [...prev, tag];
        });
      }
    };

    const handleTagRemoved = ({ cardId, tagId }: any) => {
      if (cardId === card.id) {
        setTags(prev => prev.filter(t => t.id !== tagId));
      }
    };

    socket.on('tagAddedToCard', handleTagAdded);
    socket.on('tagRemovedFromCard', handleTagRemoved);

    return () => {
      socket.off('tagAddedToCard', handleTagAdded);
      socket.off('tagRemovedFromCard', handleTagRemoved);
    };
  }, [isOpen, card?.id]);

  const handleTagAdded = (tag: any) => {
    setTags(prev => {
      if (prev.some(t => t.id === tag.id)) return prev;
      return [...prev, tag];
    });
  };

  const handleTagRemoved = (tagId: string) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
  };

  useEffect(() => {
    if (isOpen && card?.id) {
      fetchCardMembers();
      fetchCardTags();
      fetchCardAttachments();
    }
  }, [isOpen, card?.id, fetchCardMembers, fetchCardTags, fetchCardAttachments]);

  useEffect(() => {
    if (!isOpen || !card?.id) return;

    const socket = getSocket();
    
    socket.emit('joinCard', card.id);
    
    fetchComments(card.id);

    const handleNewComment = (newComment: any) => {
      if (newComment.userId === user?.id) {
        return;
      }

      if (newComment.cardId === card.id) {
        addComment(card.id, newComment);
      }
    };

    const handleCommentDeleted = ({ cardId, commentId }: any) => {
      if (cardId === card.id) {
        useBoardStore.setState((state) => ({
          comments: {
            ...state.comments,
            [cardId]: state.comments[cardId]?.filter((c) => c.id !== commentId) || [],
          },
        }));
      }
    };

    socket.on('newComment', handleNewComment);
    socket.on('commentDeleted', handleCommentDeleted);

    return () => {
      socket.emit('leaveCard', card.id);
      socket.off('newComment', handleNewComment);
      socket.off('commentDeleted', handleCommentDeleted);
    };
  }, [isOpen, card?.id, fetchComments, addComment]);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || "");
      setDueDate(card.dueDate || null);
    }
  }, [card]);

  const handleTitleBlur = async () => {
    if (title !== card?.title && title.trim()) {
      try {
        await updateCard(card.id, { title });
        toast.success("Title updated");
        setDis(true);
      } catch (error) {
        setTitle(card.title);
        toast.error("Failed to update title");
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
        toast.error("Failed to update description");
      }
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addCommentOptimistic(card.id, comment);
      setComment("");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setCommentDialogOpen(true);
  };

  const handleDeleteCard = async () => {
    if (confirm("Are you sure you want to delete this card?")) {
      try {
        setLoading(true);
        await deleteCard(card.id);
        toast.success("Card deleted");
        onClose();
      } catch (error) {
        toast.error("Failed to delete card");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMemberAdded = (member: any) => {
    setMembers(prev => {
      if (prev.some(m => m.id === member.id)) return prev;
      return [...prev, member];
    });
  };

  const handleMemberRemoved = (userId: string) => {
    setMembers(prev => prev.filter(m => m.id !== userId));
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
  <DialogContent className="sm:max-w-5xl h-[90vh] p-0 gap-0 flex flex-col">
    
    <DialogTitle className="sr-only">Card Details</DialogTitle>
    
    <div className="px-6 py-4 border-b bg-white shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col justify-baseline min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Input 
              value={title} 
              onChange={(e) => {
                setTitle(e.target.value);
                setDis(false);
              }}
              className="text-xl font-bold flex-1 border-slate-900 max-w-fit text-center rounded-sm shadow-none px-2 h-auto focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-blue-500 transition-all" 
              placeholder="Enter card title"
            />

            {card.title !== title && title.trim() && !dis && (
              <Button 
                size="sm" 
                onClick={() => handleTitleBlur()}
                className="shrink-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
      
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>in list</span>
            <Badge variant="secondary" className="font-normal">
              {card.list?.title || "To Do"}
            </Badge>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="shrink-0 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="space-y-8 pb-6">
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md">
            <User className="h-4 w-4 text-gray-500" />
            <MemberSelector
              cardId={card.id}
              boardId={boardId}
              assignedMembers={members}
              onMemberAdded={handleMemberAdded}
              onMemberRemoved={handleMemberRemoved}
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md">
            <Tag className="h-4 w-4 text-gray-500" />
            <TagSelector
              cardId={card.id}
              boardId={boardId}
              assignedTags={tags}
              onTagAdded={handleTagAdded}
              onTagRemoved={handleTagRemoved}
            />
          </div>
          
          <DueDatePicker
            cardId={card.id}
            dueDate={dueDate}
            onUpdate={handleDueDateUpdate}
          />
          <div className="ml-auto">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteCard}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <Separator />

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
                <Button size="sm"   disabled={description === ""}
 onClick={handleDescriptionSave}>
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

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">
              Attachments {attachments.length > 0 && `(${attachments.length})`}
            </h3>
          </div>
          <AttachmentUploader
            cardId={card.id}
            attachments={attachments}
            onAttachmentAdded={handleAttachmentAdded}
            onAttachmentDeleted={handleAttachmentDeleted}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Activity</h3>
          </div>
          
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

          <div className="space-y-4">
            
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((c, index) => {
                const showHeader = index === 0 || comments[index - 1].userId !== c.userId;
                
                return (
                  <div key={c.id} className="flex gap-3 group">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={`bg-gray-100 text-gray-700 text-xs ${showHeader ? "" : "hidden"}`}>
                            {showHeader && c.userName?.[0]}
                          </AvatarFallback>
                        </Avatar>

                    
                    <div className="flex-1 min-w-0">
                      {showHeader && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                          {c.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(c.createdAt), "MMM d 'at' h:mm a")}
                        </span>
                      </div>
                      )}
                      <div className="flex justify-baseline gap-2">

                      <div className=" border rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm min-w-40 w-fit bg-indigo-50">
                        {c.text}
                      </div>
                      <div className="flex gap-3 mt-1">
                        <button 
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-xs text-gray-500 hover:text-red-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                      </div>

                    <CommentDeleteDialog 
                      open={commentDialogOpen}
                      cardId={card.id}
                      commentId={c.id}
                      onOpenChange={setCommentDialogOpen}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>

  );
}