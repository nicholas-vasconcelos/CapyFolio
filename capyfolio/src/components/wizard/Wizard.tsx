import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, Check } from 'lucide-react';

/*
 * Pieces shared by the step-by-step forms (sign-up and new project):
 * the step indicator, labelled fields with an error line, and focus handling between steps.
 */

export type WizardStep = { label: string; title: string; lead: string };

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="flex items-start gap-1.5 text-sm font-semibold text-ink">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
      {message}
    </span>
  );
}

/** Label, control and error line. The error gets `${id}-error` so the control can point at it. */
export function Field({ id, label, optional, error, hint, children }: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="cf-field">
      <label htmlFor={id}>
        {label}
        {optional && <span className="ml-1.5 font-semibold text-ink-muted">(opcional)</span>}
      </label>
      {children}
      {hint && !error && <span className="text-sm text-ink-muted">{hint}</span>}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/** Props for a control inside <Field>: marks it invalid and links the error line. */
export const errorProps = (id: string, error?: string) =>
  error ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` } : {};

const GRID_COLS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

/** Step indicator: done steps in green with a check, the current one in gold. */
export function Stepper({ steps, current, label }: { steps: readonly WizardStep[]; current: number; label: string }) {
  return (
    <ol className={`m-0 grid list-none gap-2 p-0 ${GRID_COLS[steps.length] ?? 'grid-cols-4'}`} aria-label={label}>
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.label} aria-current={active ? 'step' : undefined} className="flex min-w-0 flex-col items-center gap-2 text-center">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink font-display text-[17px] font-bold ${
                done ? 'bg-brand-green text-surface' : active ? 'bg-gold text-ink shadow-xs' : 'bg-surface text-ink-muted'
              }`}
            >
              {done ? <Check className="h-5 w-5" aria-hidden="true" /> : index + 1}
            </span>
            {/* On phones only the current label shows (the others would collide); all stay readable to screen readers. */}
            <span className={`max-w-full truncate text-[13px] font-semibold sm:text-sm ${active ? 'text-ink' : 'sr-only text-ink-muted sm:not-sr-only'}`}>
              {step.label}
              {done && <span className="sr-only"> (concluída)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Heading block for the current step: "Passo n de N", title and lead. Pass the ref from useStepFocus. */
export function StepHeading({ steps, current, headingRef }: {
  steps: readonly WizardStep[];
  current: number;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const step = steps[current];
  return (
    // divs, not p: .cf-card p resets margins and colour.
    <div className="mb-8 mt-8 flex flex-col gap-1.5">
      <div className="text-[15px] font-semibold text-green-ink">Passo {current + 1} de {steps.length}</div>
      <h1 ref={headingRef} tabIndex={-1} className="m-0 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.025em] text-navy outline-none">
        {step.title}
      </h1>
      <div className="text-base leading-[1.5] text-ink-muted">{step.lead}</div>
    </div>
  );
}

/** Moves focus to the step heading whenever the step changes (not on first load), so screen readers announce it. */
export function useStepFocus(step: number) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);
  return headingRef;
}
