"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import formStyles from "@/components/admin/Form.module.css";

export type PageSection = {
  id: string;
  type: string;
  enabled: boolean;
  backgroundColor: string | null;
  config: Record<string, unknown>;
};

// Callers MUST pass `key={section?.id ?? "none"}` when rendering this so React
// remounts (and re-seeds local state) whenever a different section is opened.
export default function SectionEditorModal({
  section,
  onClose,
  onSave,
}: {
  section: PageSection | null;
  onClose: () => void;
  onSave: (input: { enabled: boolean; backgroundColor: string; config: Record<string, unknown> }) => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(section?.enabled ?? true);
  const [backgroundColor, setBackgroundColor] = useState(section?.backgroundColor ?? "");
  const [configText, setConfigText] = useState(JSON.stringify(section?.config ?? {}, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(configText);
    } catch {
      setError("Config must be valid JSON");
      return;
    }
    setError(null);
    setSaving(true);
    await onSave({ enabled, backgroundColor, config: parsed });
    setSaving(false);
  }

  return (
    <Modal open={!!section} title={`Edit Section — ${section?.type ?? ""}`} onClose={onClose} wide>
      <label className={formStyles.checkboxRow} style={{ marginBottom: 16 }}>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Enabled (visible on the site)
      </label>
      <div className={formStyles.field}>
        <label className={formStyles.label} htmlFor="section-editor-background-color">Background Color</label>
        <input id="section-editor-background-color" className={formStyles.input} placeholder="#0b0d12 or transparent" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
      </div>
      <div className={formStyles.field}>
        <label className={formStyles.label} htmlFor="section-editor-content-json">Content (JSON)</label>
        <textarea id="section-editor-content-json"
          className={formStyles.textarea}
          style={{ minHeight: 320, fontFamily: "monospace", fontSize: 12.5 }}
          value={configText}
          onChange={(e) => setConfigText(e.target.value)}
        />
        <p className={formStyles.hint}>
          Edit the section&apos;s headline, subheading, items, images, buttons, etc. directly as JSON — every field here
          is what renders on the live page.
        </p>
        {error && <p className={formStyles.error}>{error}</p>}
      </div>
      <div className={formStyles.actions}>
        <button type="button" className={formStyles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={formStyles.submitBtn} disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save Section"}
        </button>
      </div>
    </Modal>
  );
}
