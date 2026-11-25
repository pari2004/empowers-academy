"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { slug: string; title: string; category: string | null };

const MAX_SELECTION = 4;

export default function CompareProgramsPicker({
  options,
  selectedSlugs,
}: {
  options: Option[];
  selectedSlugs: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(selectedSlugs);

  function toggle(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_SELECTION) return prev;
      return [...prev, slug];
    });
  }

  function apply() {
    router.push(selected.length ? `/programs/compare?slugs=${selected.join(",")}` : "/programs/compare");
  }

  return (
    <div className="compare-picker glass-panel">
      <div className="compare-picker-grid">
        {options.map((o) => {
          const isSelected = selected.includes(o.slug);
          return (
            <label key={o.slug} className={`compare-picker-option${isSelected ? " is-selected" : ""}`}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(o.slug)}
                disabled={!isSelected && selected.length >= MAX_SELECTION}
              />
              <span>{o.title}</span>
            </label>
          );
        })}
      </div>
      <button type="button" className="btn btn-primary" onClick={apply} disabled={selected.length < 2}>
        Compare{selected.length ? ` (${selected.length})` : ""}
      </button>
    </div>
  );
}
