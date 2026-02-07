// "use client";
// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { useBoardStore } from "@/store/board";
// import { toast } from "sonner";
// import { TrashIcon } from "lucide-react";

// interface CardDetailDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   card: {
//     id: string;
//     title: string;
//     description: string | null;
//   };
// }

// export function CardDetailDialog({ open, onOpenChange, card }: CardDetailDialogProps) {
//   const [title, setTitle] = useState(card.title);
//   const [description, setDescription] = useState(card.description || "");
//   const [loading, setLoading] = useState(false);
//   const updateCard = useBoardStore((s) => s.updateCard);
//   const deleteCard = useBoardStore((s) => s.deleteCard);

//   const handleUpdate = async () => {
//     if (!title.trim()) {
//       toast.error("Title cannot be empty");
//       return;
//     }
//     setLoading(true);
//     try {
//       await updateCard(card.id, { title, description: description || null });
//       toast.success("Card updated!");
//       onOpenChange(false);
//     } catch (error: any) {
//       toast.error(error.message);
//     }
//     setLoading(false);
//   };

//   const handleDelete = async () => {
//     if (!confirm("Are you sure you want to delete this card?")) return;

//     setLoading(true);
//     try {
//       await deleteCard(card.id);
//       toast.success("Card deleted!");
//       onOpenChange(false);
//     } catch (error: any) {
//       toast.error(error.message);
//     }
//     setLoading(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-lg py-6 px-6">
//         <DialogHeader className="mb-2">
//           <DialogTitle className="text-lg font-semibold mb-1">
//             Card Details
//           </DialogTitle>
//         </DialogHeader>
//         <div className="space-y-5">
//           <div>
//             <Label htmlFor="edit-title" className="text-sm font-medium mb-1 block">
//               Title
//             </Label>
//             <Input
//               id="edit-title"
//               value={title}
//               onChange={e => setTitle(e.target.value)}
//               className="h-10 text-base"
//               maxLength={80}
//               required
//               placeholder="Enter card title"
//             />
//           </div>
//           <div>
//             <Label htmlFor="edit-description" className="text-sm font-medium mb-1 block">
//               Description
//             </Label>
//             <Textarea
//               id="edit-description"
//               value={description}
//               onChange={e => setDescription(e.target.value)}
//               className="text-base"
//               rows={5}
//               maxLength={500}
//               placeholder="Describe task details"
//             />
//           </div>
//           <div className="flex justify-end gap-2 pt-3">
//             <Button
//               type="button"
//               variant="destructive"
//               onClick={handleDelete}
//               disabled={loading}
//               className="flex items-center gap-1"
//             >
//               <TrashIcon className="w-4 h-4" />
//               Delete
//             </Button>
//             <Button type="button" onClick={handleUpdate} disabled={loading}>
//               {loading ? "Saving..." : "Save"}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
