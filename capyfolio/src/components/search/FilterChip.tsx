/** Toggle chip for a chips-style facet; gold fill when pressed (.cf-chip[aria-pressed]). */
export function FilterChip({ label, pressed, onToggle }: { label: string; pressed: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onToggle} className="cf-chip">
      {label}
    </button>
  );
}
