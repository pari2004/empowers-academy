import { z } from "zod";

// Leads used to accept any string as a phone number, so obvious junk like
// "1234567890" landed in the CRM. Indian mobile numbers are exactly 10 digits
// beginning with 6, 7, 8, or 9 — everything else (landlines typed as mobiles,
// sequential filler, short/long typos) is rejected here.
const INDIAN_MOBILE = /^[6-9]\d{9}$/;

export const INVALID_PHONE_MESSAGE =
  "Enter a valid 10-digit Indian mobile number (starting 6–9).";

// Accept the shapes people actually type — spaces, dashes, parentheses, and a
// +91 / 91 / leading-0 trunk prefix — then reduce to the bare 10-digit number.
export function normalizeIndianMobile(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return INDIAN_MOBILE.test(digits) ? digits : null;
}

export function isIndianMobile(input: string): boolean {
  return normalizeIndianMobile(input) !== null;
}

/** E.164 form (+91XXXXXXXXXX) for a valid number, else null. */
export function toE164Indian(input: string): string | null {
  const digits = normalizeIndianMobile(input);
  return digits ? `+91${digits}` : null;
}

// A valid number in any accepted shape, stored normalised to E.164 so the DB
// holds one canonical form regardless of how it was entered.
const indianMobileValue = z
  .string()
  .refine(isIndianMobile, INVALID_PHONE_MESSAGE)
  .transform((v) => toE164Indian(v) as string);

/**
 * Optional phone field: an absent, null, or blank value is fine, but anything
 * actually typed must be a valid Indian mobile. Blanks collapse to undefined so
 * an empty form field doesn't trip the validator.
 */
export const optionalIndianPhone = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  indianMobileValue.nullable().optional()
);

/** Same rules, but the field must be present and valid. */
export const requiredIndianPhone = indianMobileValue;
