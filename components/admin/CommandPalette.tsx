"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { SearchResult } from "@/lib/services/searchService";
import styles from "./CommandPalette.module.css";

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  course: "Course",
  blog: "Blog Post",
  faq: "FAQ",
  testimonial: "Testimonial",
  media: "Media",
  landingPage: "Landing Page",
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const { data } = useQuery({
    queryKey: ["admin-search", query],
    queryFn: async () => {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return { results: [] as SearchResult[] };
      return res.json() as Promise<{ results: SearchResult[] }>;
    },
    enabled: open && query.trim().length > 1,
  });

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div className={styles.dialogWrap} onClick={(e) => e.stopPropagation()}>
        <Command className={styles.command} shouldFilter={false}>
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search courses, blog posts, FAQs, testimonials, media…"
            className={styles.input}
          />
          <Command.List className={styles.list}>
            {query.trim().length > 1 && (data?.results.length ?? 0) === 0 && (
              <Command.Empty className={styles.empty}>No results found.</Command.Empty>
            )}
            {(data?.results ?? []).map((result) => (
              <Command.Item
                key={`${result.type}-${result.id}`}
                value={`${result.type}-${result.id}`}
                onSelect={() => {
                  setOpen(false);
                  router.push(result.href);
                }}
                className={styles.item}
              >
                <span className={styles.itemType}>{TYPE_LABEL[result.type]}</span>
                <span>{result.title}</span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
