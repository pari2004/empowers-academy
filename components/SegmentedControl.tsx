type SegmentedOption = { label: string; value: string };

type SegmentedControlProps = {
  label: string;
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  required?: boolean;
};

export default function SegmentedControl({
  label,
  options,
  value,
  onChange,
  error,
  className,
  required,
}: SegmentedControlProps) {
  return (
    <div className="field">
      <span>
        {label}
        {required && <span className="field-required"> *</span>}
      </span>
      <div className={`segmented ${className ?? ""}`} role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            type="button"
            key={opt.value}
            role="radio"
            aria-checked={value === opt.value}
            className={`segmented-btn ${value === opt.value ? "is-active" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <em className="field-err">{error}</em>}
    </div>
  );
}
