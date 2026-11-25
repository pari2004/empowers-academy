// Tiny window-based event bus so any button anywhere can open the brochure
// modal or the chat widget without prop drilling through the whole tree.

export type AppEvent = "open-brochure" | "open-chat" | "close-chat" | "open-lead" | "open-auth" | "open-quiz";

export function emit(event: AppEvent) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(event));
  }
}

export function on(event: AppEvent, handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(event, handler as EventListener);
  return () => window.removeEventListener(event, handler as EventListener);
}

export function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
