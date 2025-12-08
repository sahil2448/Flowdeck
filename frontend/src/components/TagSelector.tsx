"use client";

import { useState, useEffect } from "react";
import { Check, Plus, X, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tagApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagSelectorProps {
  cardId: string;
  boardId: string;
  assignedTags: Tag[];
  onTagAdded: (tag: Tag) => void;
  onTagRemoved: (tagId: string) => void;
}

const TAG_COLORS = [
  { name: "Gray", value: "#6B7280", bg: "bg-gray-500" },
  { name: "Red", value: "#EF4444", bg: "bg-red-500" },
  { name: "Orange", value: "#F97316", bg: "bg-orange-500" },
  { name: "Yellow", value: "#EAB308", bg: "bg-yellow-500" },
  { name: "Green", value: "#22C55E", bg: "bg-green-500" },
  { name: "Blue", value: "#3B82F6", bg: "bg-blue-500" },
  { name: "Purple", value: "#A855F7", bg: "bg-purple-500" },
  { name: "Pink", value: "#EC4899", bg: "bg-pink-500" },
];

export function TagSelector({
  cardId,
  boardId,
  assignedTags,
  onTagAdded,
  onTagRemoved,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [boardTags, setBoardTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value);

  useEffect(() => {
    if (open && boardId) {
      fetchBoardTags();
    }
  }, [open, boardId]);

  const fetchBoardTags = async () => {
    try {
      setLoading(true);
      const res = await tagApi.getBoardTags(boardId);
      setBoardTags(res.data.tags);
    } catch (error) {
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (tagId: string) => {
    try {
      const res = await tagApi.addToCard(cardId, tagId);
      onTagAdded(res.data.tag);
      toast.success("Tag added");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add tag");
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      await tagApi.removeFromCard(cardId, tagId);
      onTagRemoved(tagId);
      toast.success("Tag removed");
    } catch (error) {
      toast.error("Failed to remove tag");
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    try {
      const res = await tagApi.create({
        boardId,
        name: newTagName.trim(),
        color: selectedColor,
      });
      setBoardTags([...boardTags, res.data.tag]);
      setShowCreateDialog(false);
      setNewTagName("");
      setSelectedColor(TAG_COLORS[0].value);
      toast.success("Tag created");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create tag");
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm("Delete this tag? It will be removed from all cards.")) return;

    try {
      await tagApi.delete(tagId);
      setBoardTags(boardTags.filter(t => t.id !== tagId));
      if (assignedTags.some(t => t.id === tagId)) {
        onTagRemoved(tagId);
      }
      toast.success("Tag deleted");
    } catch (error) {
      toast.error("Failed to delete tag");
    }
  };

  const isAssigned = (tagId: string) =>
    assignedTags.some(t => t.id === tagId);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Display Assigned Tags */}
        {assignedTags.map(tag => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.color }}
            className="text-white px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-80"
            onClick={() => handleRemoveTag(tag.id)}
          >
            {tag.name}
            <X className="h-3 w-3 ml-1 inline" />
          </Badge>
        ))}

        {/* Add Tag Button */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 px-2">
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Labels</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create
                </Button>
              </div>
            </div>
            <ScrollArea className="h-64">
              <div className="p-2 space-y-1">
                {loading ? (
                  <p className="text-sm text-center text-gray-500 py-4">
                    Loading...
                  </p>
                ) : boardTags.length === 0 ? (
                  <p className="text-sm text-center text-gray-500 py-4">
                    No labels yet. Create one!
                  </p>
                ) : (
                  boardTags.map(tag => {
                    const assigned = isAssigned(tag.id);
                    return (
                      <div
                        key={tag.id}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 group"
                      >
                        <div
                          className="flex-1 flex items-center gap-2 cursor-pointer"
                          onClick={() =>
                            assigned
                              ? handleRemoveTag(tag.id)
                              : handleAddTag(tag.id)
                          }
                        >
                          <div
                            className="w-8 h-6 rounded"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm font-medium flex-1">
                            {tag.name}
                          </span>
                          {assigned && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {/* Create Tag Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Label</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                placeholder="Label name"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreateTag()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="grid grid-cols-4 gap-2">
                {TAG_COLORS.map(color => (
                  <button
                  title="selector"
                    key={color.value}
                    className={`h-10 rounded-md ${color.bg} ${
                      selectedColor === color.value
                        ? "ring-2 ring-offset-2 ring-black"
                        : ""
                    }`}
                    onClick={() => setSelectedColor(color.value)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTag} className="flex-1">
                Create
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewTagName("");
                  setSelectedColor(TAG_COLORS[0].value);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
