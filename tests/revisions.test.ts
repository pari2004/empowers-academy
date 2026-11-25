import { describe, it, expect } from "vitest";
import { shallowDiff } from "@/lib/revisions";

describe("shallowDiff", () => {
  it("reports only fields that actually changed", () => {
    const before = { title: "Old", price: 100, tags: ["a", "b"] };
    const after = { title: "New", price: 100, tags: ["a", "b"] };
    const diff = shallowDiff(before, after);
    expect(diff).toEqual([{ field: "title", before: "Old", after: "New" }]);
  });

  it("detects array/object changes via deep value comparison", () => {
    const diff = shallowDiff({ tags: ["a"] }, { tags: ["a", "b"] });
    expect(diff).toEqual([{ field: "tags", before: ["a"], after: ["a", "b"] }]);
  });

  it("returns no changes for identical objects", () => {
    expect(shallowDiff({ a: 1, b: "x" }, { a: 1, b: "x" })).toEqual([]);
  });

  it("reports fields added or removed between versions", () => {
    const diff = shallowDiff({ a: 1 }, { a: 1, b: 2 });
    expect(diff).toEqual([{ field: "b", before: undefined, after: 2 }]);
  });
});
