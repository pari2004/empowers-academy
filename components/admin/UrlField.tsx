"use client";

import { useState } from "react";
import formStyles from "@/components/admin/Form.module.css";
import styles from "@/components/admin/UrlField.module.css";
import { urlKind, validateUrl, type UrlKind } from "@/lib/validation/url";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Fields like social profiles only ever point off-site. */
  externalOnly?: boolean;
  hint?: string;
  required?: boolean;
};

export default function UrlField({
  id,
  label,
  value,
  onChange,
  externalOnly,
  hint,
  required,
}: Props) {
  // Start on whichever kind the saved value already is, so editing an existing
  // record doesn't flip it to the wrong mode.
  const [kind, setKind] = useState<UrlKind>(() =>
    externalOnly ? "external" : value ? urlKind(value) : "internal"
  );
  const [touched, setTouched] = useState(false);

  const effectiveKind: UrlKind = externalOnly ? "external" : kind;
  const error = touched ? validateUrl(value, effectiveKind) : undefined;

  const placeholder =
    effectiveKind === "internal"
      ? "/api/media/uploads/photo.jpg"
      : "https://example.com/photo.jpg";

  return (
    <div className={formStyles.field}>
      <label className={formStyles.label} htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      <div className={styles.row}>
        {!externalOnly && (
          <div className={styles.toggle} role="group" aria-label={`${label} link type`}>
            {(["internal", "external"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={styles.toggleBtn}
                aria-pressed={kind === k}
                onClick={() => {
                  setKind(k);
                  setTouched(true);
                }}
              >
                {k === "internal" ? "Internal" : "External"}
              </button>
            ))}
          </div>
        )}

        <input
          id={id}
          className={`${formStyles.input} ${styles.input}`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={!!error}
        />
      </div>

      {hint && !error && <p className={formStyles.hint}>{hint}</p>}
      {error && <p className={formStyles.error}>{error}</p>}
    </div>
  );
}
