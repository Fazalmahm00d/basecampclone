// components/RichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RichTextEditorProps {
  value: string;
  subject: string;
  category: string;
  onChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const MESSAGE_CATEGORIES = [
  { value: "announcement", label: "Announcement" },
  { value: "pitch", label: "Pitch" },
  { value: "question", label: "Question" },
  { value: "discussion", label: "Discussion" },
  { value: "other", label: "Other" }
];

export default function RichTextEditor({ 
  value, 
  subject, 
  category, 
  onChange, 
  onSubjectChange, 
  onCategoryChange 
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Subject Input */}
      <div>
        <Input
          placeholder="Subject (optional)"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Category Select */}
      <div>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select category (optional)" />
          </SelectTrigger>
          <SelectContent>
            {MESSAGE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rich Text Editor */}
      <div className="border rounded-lg p-4">
        <div className="border-b pb-2 mb-2 flex gap-2">
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-blue-200' : ''}
            variant="outline"
            size="sm"
          >
            Bold
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-blue-200' : ''}
            variant="outline"
            size="sm"
          >
            Italic
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-blue-200' : ''}
            variant="outline"
            size="sm"
          >
            Bullet List
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-blue-200' : ''}
            variant="outline"
            size="sm"
          >
            Numbered List
          </Button>
        </div>
        <EditorContent editor={editor} className="prose max-w-none min-h-[150px]" />
      </div>
    </div>
  );
}