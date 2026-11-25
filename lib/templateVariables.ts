// Renders `{{variable}}` tokens inside email/WhatsApp/SMS template bodies.
// Every substituted value is HTML-escaped by default — templates are sent as
// HTML email, so an unescaped value (e.g. a lead name containing `<script>`)
// would be a stored/reflected XSS vector. Pass `raw: true` only for values
// that are already-sanitized HTML fragments meant to be inlined verbatim
// (none of the current template variables need this).

const TOKEN_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

export type TemplateVariables = Record<string, string | number | null | undefined>;

/** Replaces every `{{key}}` in `template` with the escaped value of `vars[key]`. Unknown tokens are left as-is. */
export function renderTemplate(template: string, vars: TemplateVariables): string {
  return template.replace(TOKEN_PATTERN, (match, key: string) => {
    if (!(key in vars)) return match;
    const value = vars[key];
    if (value === null || value === undefined) return "";
    return escapeHtml(String(value));
  });
}

/** Extracts the distinct `{{key}}` tokens referenced in a template body, in first-seen order. */
export function extractTemplateVariables(template: string): string[] {
  const seen = new Set<string>();
  for (const match of template.matchAll(TOKEN_PATTERN)) {
    seen.add(match[1]);
  }
  return [...seen];
}

// The canonical variable catalogue documented in the Phase 6 brief — surfaced
// in the Email Template editor's variable picker.
export const STANDARD_TEMPLATE_VARIABLES = [
  "studentName",
  "courseName",
  "batchName",
  "paymentAmount",
  "dueDate",
  "meetingLink",
] as const;
