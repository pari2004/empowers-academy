import { z } from "zod";

// CMS URL fields hold one of two things: a path inside this site (an uploaded
// asset at /api/media/..., or a route like /about), or a full off-site URL.
// z.string().url() rejects the first kind, so anything pointing at our own
// media used to fail with "Invalid url".
export type UrlKind = "internal" | "external";

export const INTERNAL_URL_MESSAGE =
  'Internal links must start with "/" — e.g. /api/media/uploads/photo.jpg';
export const EXTERNAL_URL_MESSAGE =
  "External links must be a full http(s) URL — e.g. https://example.com/photo.jpg";
export const ANY_URL_MESSAGE =
  'Enter a site path starting with "/" or a full http(s) URL';

export function isInternalUrl(value: string): boolean {
  // "//evil.com" is protocol-relative: it looks internal but sends the browser
  // to another host, so it is not a site path.
  return value.startsWith("/") && !value.startsWith("//");
}

export function isExternalUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** What kind of link the user appears to have typed. */
export function urlKind(value: string): UrlKind {
  return value.startsWith("/") ? "internal" : "external";
}

/** Validate against one specific kind — used once the editor has picked one. */
export function validateUrl(value: string, kind: UrlKind): string | undefined {
  if (!value) return undefined;
  if (kind === "internal") return isInternalUrl(value) ? undefined : INTERNAL_URL_MESSAGE;
  return isExternalUrl(value) ? undefined : EXTERNAL_URL_MESSAGE;
}

const accepts = (value: string) => isInternalUrl(value) || isExternalUrl(value);

/** A link that may be internal or external. */
export const linkUrl = z.string().refine(accepts, ANY_URL_MESSAGE);

/** Same, but the field must be filled in. */
export function requiredLinkUrl(requiredMessage: string) {
  return z.string().min(1, requiredMessage).refine(accepts, ANY_URL_MESSAGE);
}

/** A link that only makes sense pointing off-site (social profiles, etc). */
export const externalUrl = z.string().refine(isExternalUrl, EXTERNAL_URL_MESSAGE);
