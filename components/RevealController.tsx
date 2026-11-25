"use client";

import { useReveal } from "@/lib/useReveal";

// Mounts the single IntersectionObserver that animates `.reveal` elements.
export default function RevealController() {
  useReveal();
  return null;
}
