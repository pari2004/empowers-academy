import { describe, it, expect } from "vitest";
import {
  isInternalUrl,
  isExternalUrl,
  urlKind,
  validateUrl,
  linkUrl,
  externalUrl,
} from "@/lib/validation/url";

describe("internal urls", () => {
  it("accepts uploaded media paths and site routes", () => {
    expect(isInternalUrl("/api/media/uploads/123-photo.jpg")).toBe(true);
    expect(isInternalUrl("/about")).toBe(true);
  });

  it("rejects protocol-relative urls that point off-site", () => {
    // "//evil.com" looks like a path but navigates to another host.
    expect(isInternalUrl("//evil.com/photo.jpg")).toBe(false);
  });

  it("rejects bare text and absolute urls", () => {
    expect(isInternalUrl("photo.jpg")).toBe(false);
    expect(isInternalUrl("https://example.com")).toBe(false);
  });
});

describe("external urls", () => {
  it("accepts http and https", () => {
    expect(isExternalUrl("https://example.com/a.png")).toBe(true);
    expect(isExternalUrl("http://example.com")).toBe(true);
  });

  it("rejects non-http protocols and junk", () => {
    expect(isExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isExternalUrl("ftp://example.com")).toBe(false);
    expect(isExternalUrl("not a url")).toBe(false);
    expect(isExternalUrl("/api/media/uploads/a.jpg")).toBe(false);
  });
});

describe("urlKind", () => {
  it("classifies by leading slash", () => {
    expect(urlKind("/api/media/uploads/a.jpg")).toBe("internal");
    expect(urlKind("https://example.com")).toBe("external");
  });
});

describe("validateUrl against the chosen kind", () => {
  it("errors when the value doesn't match the selected kind", () => {
    expect(validateUrl("https://example.com", "internal")).toBeDefined();
    expect(validateUrl("/api/media/uploads/a.jpg", "external")).toBeDefined();
  });

  it("passes when it matches", () => {
    expect(validateUrl("/api/media/uploads/a.jpg", "internal")).toBeUndefined();
    expect(validateUrl("https://example.com", "external")).toBeUndefined();
  });

  it("treats an empty value as not-yet-filled rather than invalid", () => {
    expect(validateUrl("", "internal")).toBeUndefined();
  });
});

describe("zod schemas", () => {
  it("linkUrl takes either kind — this is what broke uploaded media", () => {
    expect(linkUrl.safeParse("/api/media/uploads/a.jpg").success).toBe(true);
    expect(linkUrl.safeParse("https://example.com/a.jpg").success).toBe(true);
    expect(linkUrl.safeParse("nonsense").success).toBe(false);
    expect(linkUrl.safeParse("//evil.com").success).toBe(false);
  });

  it("externalUrl stays external-only", () => {
    expect(externalUrl.safeParse("https://linkedin.com/in/x").success).toBe(true);
    expect(externalUrl.safeParse("/api/media/uploads/a.jpg").success).toBe(false);
  });
});
