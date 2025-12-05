"use client";

import { useState, useEffect } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memberApi } from "@/lib/api";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  email: string;
}

interface MemberSelectorProps {
  cardId: string;
  boardId: string;
  assignedMembers: Member[];
  onMemberAdded: (member: Member) => void;
  onMemberRemoved: (userId: string) => void;
}

export function MemberSelector({
  cardId,
  boardId,
  assignedMembers,
  onMemberAdded,
  onMemberRemoved,
}: MemberSelectorProps) {
  const [open, setOpen] = useState(false);
  const [boardMembers, setBoardMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBoardMembers();
    }
  }, [open]);

  const fetchBoardMembers = async () => {
    try {
      setLoading(true);
      const res = await memberApi.getBoardMembers(boardId);
      setBoardMembers(res.data.members);
    } catch (error) {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      const res = await memberApi.addMember(cardId, userId);
      onMemberAdded(res.data.member);
      toast.success("Member added");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await memberApi.removeMember(cardId, userId);
      onMemberRemoved(userId);
      toast.success("Member removed");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const isAssigned = (userId: string) =>
    assignedMembers.some((m) => m.id === userId);

  const filteredMembers = boardMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex items-center gap-2">
      {/* Assigned Members Avatars */}
      <div className="flex -space-x-2">
        {assignedMembers.slice(0, 3).map((member) => (
          <Avatar
            key={member.id}
            className="h-8 w-8 border-2 border-white hover:z-10 cursor-pointer"
            onClick={() => handleRemoveMember(member.id)}
          >
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
              {member.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {assignedMembers.length > 3 && (
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
              +{assignedMembers.length - 3}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Add Member Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <h4 className="font-semibold mb-2">Members</h4>
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>
          <ScrollArea className="h-64">
            <div className="p-2 space-y-1">
              {loading ? (
                <p className="text-sm text-center text-gray-500 py-4">
                  Loading...
                </p>
              ) : filteredMembers.length === 0 ? (
                <p className="text-sm text-center text-gray-500 py-4">
                  No members found
                </p>
              ) : (
                filteredMembers.map((member) => {
                  const assigned = isAssigned(member.id);
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        assigned
                          ? handleRemoveMember(member.id)
                          : handleAddMember(member.id)
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-100 text-gray-700 text-xs">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      {assigned && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
