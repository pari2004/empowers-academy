// Converts between our storage shape (`Block[]`, from lib/resources.ts — the
// same shape ArticleBody.tsx already renders) and Tiptap's ProseMirror JSON
// document, so the rich text editor round-trips through content that never
// needs dangerouslySetInnerHTML anywhere in the app.

import type { Block } from "@/lib/resources";

type PMNode = { type: string; attrs?: Record<string, unknown>; content?: PMNode[]; text?: string };
type PMDoc = { type: "doc"; content: PMNode[] };

function textNode(text: string): PMNode[] {
  return text.length > 0 ? [{ type: "text", text }] : [];
}

function extractText(node: PMNode | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(extractText).join("");
}

function extractParagraphText(node: PMNode): string {
  return (node.content ?? []).map(extractText).join("");
}

export function blocksToDoc(blocks: Block[]): PMDoc {
  const content: PMNode[] = blocks.map((b) => {
    switch (b.type) {
      case "p":
        return { type: "paragraph", content: textNode(b.text) };
      case "h2":
        return { type: "heading", attrs: { level: 2 }, content: textNode(b.text) };
      case "h3":
        return { type: "heading", attrs: { level: 3 }, content: textNode(b.text) };
      case "ul":
        return {
          type: "bulletList",
          content: b.items.map((item) => ({
            type: "listItem",
            content: [{ type: "paragraph", content: textNode(item) }],
          })),
        };
      case "ol":
        return {
          type: "orderedList",
          content: b.items.map((item) => ({
            type: "listItem",
            content: [{ type: "paragraph", content: textNode(item) }],
          })),
        };
      case "code":
        return { type: "codeBlock", content: textNode(b.code) };
      case "callout":
        return { type: "blockquote", content: [{ type: "paragraph", content: textNode(b.text) }] };
      case "image":
        return { type: "image", attrs: { src: b.src, alt: b.alt ?? "" } };
      case "table":
        return {
          type: "table",
          content: b.rows.map((row) => ({
            type: "tableRow",
            content: row.map((cell) => ({ type: "tableCell", content: [{ type: "paragraph", content: textNode(cell) }] })),
          })),
        };
      case "embed":
        return { type: "youtube", attrs: { src: b.url } };
    }
  });

  return { type: "doc", content: content.length > 0 ? content : [{ type: "paragraph" }] };
}

export function docToBlocks(doc: PMDoc): Block[] {
  const blocks: Block[] = [];

  for (const node of doc.content ?? []) {
    switch (node.type) {
      case "paragraph": {
        const text = extractParagraphText(node);
        if (text.trim()) blocks.push({ type: "p", text });
        break;
      }
      case "heading": {
        const level = (node.attrs?.level as number) ?? 2;
        blocks.push({ type: level <= 2 ? "h2" : "h3", text: extractParagraphText(node) });
        break;
      }
      case "bulletList":
        blocks.push({ type: "ul", items: (node.content ?? []).map((li) => extractText(li)) });
        break;
      case "orderedList":
        blocks.push({ type: "ol", items: (node.content ?? []).map((li) => extractText(li)) });
        break;
      case "codeBlock":
        blocks.push({ type: "code", code: extractText(node) });
        break;
      case "blockquote":
        blocks.push({ type: "callout", text: extractText(node) });
        break;
      case "image":
        blocks.push({ type: "image", src: (node.attrs?.src as string) ?? "", alt: node.attrs?.alt as string | undefined });
        break;
      case "table":
        blocks.push({
          type: "table",
          rows: (node.content ?? []).map((row) => (row.content ?? []).map((cell) => extractText(cell))),
        });
        break;
      case "youtube":
        blocks.push({ type: "embed", url: (node.attrs?.src as string) ?? "" });
        break;
      default:
        break;
    }
  }

  return blocks;
}
