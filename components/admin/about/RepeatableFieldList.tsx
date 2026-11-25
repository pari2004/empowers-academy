"use client";

import formStyles from "@/components/admin/Form.module.css";

type FieldConfig<T> = { key: keyof T & string; label: string; multiline?: boolean };

export default function RepeatableFieldList<T extends Record<string, string | undefined>>({
  items,
  onChange,
  fields,
  emptyItem,
  addLabel,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  fields: FieldConfig<T>[];
  emptyItem: T;
  addLabel: string;
}) {
  function update(index: number, key: keyof T & string, value: string) {
    const next = items.slice();
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} style={{ border: "1px solid var(--adm-border)", borderRadius: 8, padding: 12, marginBottom: 10 }}>
          <div className={formStyles.grid2}>
            {fields.map((f) =>
              f.multiline ? (
                <div className={formStyles.field} key={f.key}>
                  <label className={formStyles.label}>{f.label}</label>
                  <textarea className={formStyles.textarea} value={item[f.key] ?? ""} onChange={(e) => update(index, f.key, e.target.value)} />
                </div>
              ) : (
                <div className={formStyles.field} key={f.key}>
                  <label className={formStyles.label}>{f.label}</label>
                  <input className={formStyles.input} value={item[f.key] ?? ""} onChange={(e) => update(index, f.key, e.target.value)} />
                </div>
              )
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" className={formStyles.cancelBtn} onClick={() => move(index, -1)} disabled={index === 0}>
              ↑ Up
            </button>
            <button type="button" className={formStyles.cancelBtn} onClick={() => move(index, 1)} disabled={index === items.length - 1}>
              ↓ Down
            </button>
            <button type="button" className={formStyles.cancelBtn} onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" className={formStyles.cancelBtn} onClick={() => onChange([...items, emptyItem])}>
        + {addLabel}
      </button>
    </div>
  );
}
