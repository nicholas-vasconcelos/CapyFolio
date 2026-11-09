export function EmptyState({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="cf-empty">
      <h3>{title}</h3>
      <p>{text}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="cf-btn cta">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
