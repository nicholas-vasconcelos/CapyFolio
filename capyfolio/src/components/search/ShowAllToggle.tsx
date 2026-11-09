/** "Ver todas (N)" / "Mostrar menos". `allLabel` carries the noun's gender ("Ver todos" / "Ver todas"). */
export function ShowAllToggle({ expanded, total, allLabel, controls, onToggle }: {
  expanded: boolean;
  total: number;
  allLabel: string;
  controls: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={controls}
      className="cf-link min-h-[44px] cursor-pointer self-start border-0 bg-transparent p-0 text-[15px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-focus"
    >
      {expanded ? 'Mostrar menos' : `${allLabel} (${total})`}
    </button>
  );
}
