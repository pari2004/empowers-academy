"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import type { Block } from "@/lib/resources";
import { blocksToDoc, docToBlocks } from "@/lib/richtext/blocks";
import styles from "./RichTextEditor.module.css";

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: blocksToDoc(value) as never,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(docToBlocks(editor.getJSON() as never));
    },
  });

  if (!editor) return null;

  function promptAndRun(label: string, run: (val: string) => void) {
    const val = window.prompt(label);
    if (val) run(val);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? styles.active : ""}>
          B
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? styles.active : ""}>
          I
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? styles.active : ""}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive("heading", { level: 3 }) ? styles.active : ""}>
          H3
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? styles.active : ""}>
          • List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? styles.active : ""}>
          1. List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive("codeBlock") ? styles.active : ""}>
          Code
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive("blockquote") ? styles.active : ""}>
          Callout
        </button>
        <button type="button" onClick={() => promptAndRun("Image URL", (src) => editor.chain().focus().setImage({ src }).run())}>
          Image
        </button>
        <button
          type="button"
          onClick={() =>
            promptAndRun("Link URL", (url) => editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run())
          }
        >
          Link
        </button>
        <button type="button" onClick={() => promptAndRun("YouTube URL", (src) => editor.commands.setYoutubeVideo({ src }))}>
          YouTube
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          Table
        </button>
      </div>
      <EditorContent editor={editor} className={styles.content} />
    </div>
  );
}
