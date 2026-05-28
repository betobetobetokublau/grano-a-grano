/**
 * Field wrapper compartido: label + children + hint opcional.
 * Usado por AddCoffeeSheet y EditCoffeeSheet.
 */

type Props = {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
};

export function Field({ label, htmlFor, hint, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text-muted">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-text-quiet">{hint}</span>}
    </div>
  );
}
