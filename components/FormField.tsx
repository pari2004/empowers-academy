type FormFieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  name?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  onBlur?: () => void;
};

export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required,
  name,
  autoComplete,
  inputMode,
  onBlur,
}: FormFieldProps) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <span className="field-required"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={!!error}
      />
      {error && <em className="field-err">{error}</em>}
    </label>
  );
}
