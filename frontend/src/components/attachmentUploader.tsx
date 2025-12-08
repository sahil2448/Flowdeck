"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  File,
  FileVideo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { attachmentApi } from "@/lib/api";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";

interface Attachment {
  id: string;
  filename: string;
  url?: string | null;
  fileSize: number;
  fileType?: string | null;
  createdAt?: string | number | null;
  user?: {
    name: string;
  };
}

interface AttachmentUploaderProps {
  cardId: string;
  attachments: Attachment[];
  onAttachmentAdded: (attachment: Attachment) => void;
  onAttachmentDeleted: (attachmentId: string) => void;
}

export function AttachmentUploader({
  cardId,
  attachments,
  onAttachmentAdded,
  onAttachmentDeleted,
}: AttachmentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const res = await attachmentApi.upload(cardId, file);
      // Debug: inspect server response shape
      console.debug("attachment upload response:", res?.data);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // normalize response if needed (res.data.attachment or res.data)
      const attachment = res?.data?.attachment ?? res?.data;
      if (attachment) {
        onAttachmentAdded(attachment);
        toast.success("File uploaded successfully");
      } else {
        toast.error("Upload succeeded but server returned unexpected payload");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to upload file");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }, []);

  const handleDelete = async (attachmentId: string) => {
    if (!confirm("Delete this attachment?")) return;

    try {
      await attachmentApi.delete(attachmentId);
      onAttachmentDeleted(attachmentId);
      toast.success("Attachment deleted");
    } catch (error) {
      toast.error("Failed to delete attachment");
    }
  };

  const getFileIcon = (fileType?: string | null) => {
    if (!fileType) {
      return <File className="h-8 w-8 text-gray-400" />;
    }

    if (typeof fileType === "string" && fileType.startsWith("image/")) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }

    if (fileType === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-500" />;
    }

    if (typeof fileType === "string" && fileType.startsWith("video/")) {
      return <FileVideo className="h-8 w-8 text-purple-500" />;
    }

    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const getFileUrl = (url?: string | null) => {
    if (!url || typeof url !== "string") return "";
    if (url.startsWith("/uploads")) {
      return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${url}`;
    }
    return url;
  };

  const parseAttachmentDate = (value?: string | number | null): Date | null => {
    if (value === null || value === undefined || value === "") return null;

    if (typeof value === "number") {
      const asMs = value < 1e12 ? value * 1000 : value; // heuristic
      const d = new Date(asMs);
      return isValid(d) ? d : null;
    }

    if (typeof value === "string") {
      try {
        const parsedISO = parseISO(value);
        if (isValid(parsedISO)) return parsedISO;
      } catch (e) {
      }

      const d = new Date(value);
      return isValid(d) ? d : null;
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-blue-500 animate-bounce" />
            <p className="text-sm text-gray-600">Uploading...</p>
            <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
          </div>
        ) : (
          <>
            <Paperclip className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Drop files here or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">
              Supports images, PDFs, and documents (max 10MB)
            </p>
          </>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const fileUrl = getFileUrl(attachment.url);
            const createdAtDate = parseAttachmentDate(attachment.createdAt);
            if (!createdAtDate && attachment.createdAt) {
              console.warn("Invalid createdAt value for attachment:", {
                id: attachment.id,
                createdAt: attachment.createdAt,
              });
            }
            const createdAtText = createdAtDate ? format(createdAtDate, "MMM d, h:mm a") : "Unknown date";

            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 group"
              >
                <div className="text-gray-400">{getFileIcon(attachment.fileType)}</div>

                <div className="flex-1 min-w-0">
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline block truncate"
                    >
                      {attachment.filename}
                    </a>
                  ) : (
                    <span className="text-sm font-medium block truncate">{attachment.filename}</span>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatBytes(attachment.fileSize)}</span>
                    <span>•</span>
                    <span>{createdAtText}</span>
                    {attachment.user && (
                      <>
                        <span>•</span>
                        <span>{attachment.user.name}</span>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => handleDelete(attachment.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
