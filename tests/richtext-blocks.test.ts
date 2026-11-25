import { describe, it, expect } from "vitest";
import { blocksToDoc, docToBlocks } from "@/lib/richtext/blocks";
import type { Block } from "@/lib/resources";

describe("blocksToDoc / docToBlocks round-trip", () => {
  const sample: Block[] = [
    { type: "h2", text: "A Heading" },
    { type: "p", text: "Some paragraph text." },
    { type: "ul", items: ["one", "two", "three"] },
    { type: "ol", items: ["first", "second"] },
    { type: "code", code: "const x = 1;" },
    { type: "callout", text: "Heads up!" },
    { type: "image", src: "https://example.com/a.png", alt: "an image" },
    { type: "table", rows: [["a", "b"], ["c", "d"]] },
    { type: "embed", url: "https://youtube.com/watch?v=abc" },
  ];

  it("round-trips every block type without loss", () => {
    const doc = blocksToDoc(sample);
    const result = docToBlocks(doc as never);
    expect(result).toEqual(sample);
  });

  it("produces a valid non-empty doc for an empty block list", () => {
    const doc = blocksToDoc([]);
    expect(doc.type).toBe("doc");
    expect(doc.content.length).toBeGreaterThan(0);
  });

  it("drops empty paragraphs on the way back (whitespace-only text)", () => {
    const doc = blocksToDoc([{ type: "p", text: "   " }]);
    const result = docToBlocks(doc as never);
    expect(result).toEqual([]);
  });
});
