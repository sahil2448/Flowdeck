"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Add a more detailed description...",
        emptyEditorClass: "is-editor-empty text-muted-foreground cursor-text",
      }),
    ],
    content: content,
    editable: editable,
    // ✅ FIX IS HERE: Disable immediate rendering to prevent SSR mismatch
    immediatelyRender: false, 
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none dark:prose-invert",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      {editable && (
        <div className="flex items-center gap-1 border rounded-md p-1 bg-gray-50/50">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label="Toggle bold"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Toggle italic"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Toggle bullet list"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Toggle ordered list"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
