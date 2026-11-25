import { z } from "zod";

// `z.string().url().optional().nullable()` is a common Zod footgun: `.optional()`/`.nullable()`
// only allow `undefined`/`null` through, not `""`. A cleared/never-filled-in text input submits
// `""`, which still runs the `.url()` check and fails with Zod's generic "Invalid url" message —
// with no indication of which field triggered it. These helpers fix both problems: empty string
// is treated as "not provided", and the error (when the value genuinely isn't valid) names the field.

function isAbsoluteUrl(value: string): boolean {
  try {
    // Same check Zod's own `.url()` uses under the hood — accepts any scheme (https, S3's
    // https endpoints, Cloudinary, http://localhost:3000 for local dev, etc).
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * For optional CMS media/asset fields (hero images, thumbnails, banners, gallery images,
 * instructor photos, brochure files, video URLs) that may be uploaded to storage (absolute URL)
 * or reference a locally-hosted public asset (a site-relative path like `/uploads/x.png`).
 * Empty string, null, and undefined are all treated as "not set".
 */
export function optionalUrlOrPath(label: string) {
  return z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((v) => !v || v.startsWith("/") || isAbsoluteUrl(v), {
      message: `${label} must be a valid URL (e.g. https://...) or an uploaded file path (starting with /)`,
    });
}

/** Same as `optionalUrlOrPath`, but required — for asset fields a record can't be saved without. */
export function requiredUrlOrPath(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => v.startsWith("/") || isAbsoluteUrl(v), {
      message: `${label} must be a valid URL (e.g. https://...) or an uploaded file path (starting with /)`,
    });
}

/**
 * For optional fields that must always point off-site (a Zoom/Meet link, a social profile) —
 * a relative path never makes sense here, but empty string must still be accepted.
 */
export function optionalUrl(label: string) {
  return z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((v) => !v || isAbsoluteUrl(v), {
      message: `${label} must be a valid URL starting with http:// or https://`,
    });
}

/** `z.string().email().optional()` has the identical empty-string footgun — same fix, for emails. */
export function optionalEmail(label: string) {
  return z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: `${label} must be a valid email address`,
    });
}
