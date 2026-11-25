import { describe, it, expect } from "vitest";
import {
  isIndianMobile,
  normalizeIndianMobile,
  toE164Indian,
  optionalIndianPhone,
  requiredIndianPhone,
} from "@/lib/validation/phone";

describe("isIndianMobile", () => {
  it("accepts 10-digit numbers starting 6-9", () => {
    expect(isIndianMobile("9876543210")).toBe(true);
    expect(isIndianMobile("6000000000")).toBe(true);
  });

  it("accepts the shapes people actually type", () => {
    expect(isIndianMobile("+91 98765 43210")).toBe(true);
    expect(isIndianMobile("91-9876543210")).toBe(true);
    expect(isIndianMobile("098765 43210")).toBe(true);
    expect(isIndianMobile("(98765) 43210")).toBe(true);
  });

  it("rejects the junk that used to land in the CRM", () => {
    // The original report: 10 digits, but starts with 1 — not a mobile prefix.
    expect(isIndianMobile("1234567890")).toBe(false);
    expect(isIndianMobile("0000000000")).toBe(false);
    expect(isIndianMobile("5555555555")).toBe(false); // landline-style prefix
  });

  it("rejects wrong-length input", () => {
    expect(isIndianMobile("98765")).toBe(false);
    expect(isIndianMobile("98765432101")).toBe(false);
    expect(isIndianMobile("")).toBe(false);
  });
});

describe("normalization", () => {
  it("strips +91 / 91 / leading-0 and formatting", () => {
    expect(normalizeIndianMobile("+91 98765-43210")).toBe("9876543210");
    expect(normalizeIndianMobile("09876543210")).toBe("9876543210");
  });

  it("canonicalises to E.164", () => {
    expect(toE164Indian("98765 43210")).toBe("+919876543210");
    expect(toE164Indian("1234567890")).toBe(null);
  });
});

describe("optionalIndianPhone schema", () => {
  it("treats absent / null / blank as not provided", () => {
    expect(optionalIndianPhone.safeParse(undefined).success).toBe(true);
    expect(optionalIndianPhone.safeParse(null).success).toBe(true);
    expect(optionalIndianPhone.safeParse("").success).toBe(true);
    expect(optionalIndianPhone.safeParse("   ").success).toBe(true);
  });

  it("stores valid input normalised to E.164", () => {
    const parsed = optionalIndianPhone.safeParse("98765 43210");
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data).toBe("+919876543210");
  });

  it("rejects junk numbers when a value is given", () => {
    expect(optionalIndianPhone.safeParse("1234567890").success).toBe(false);
  });
});

describe("requiredIndianPhone schema", () => {
  it("requires a valid value", () => {
    expect(requiredIndianPhone.safeParse("9876543210").success).toBe(true);
    expect(requiredIndianPhone.safeParse("").success).toBe(false);
    expect(requiredIndianPhone.safeParse("1234567890").success).toBe(false);
  });
});
