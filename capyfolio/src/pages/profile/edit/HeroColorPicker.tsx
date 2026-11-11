import { Check } from 'lucide-react';
import { HERO_COLORS, heroColorOf, type HeroColor } from '../../../lib/heroColors';

/**
 * Owner in edit mode: picks the hero background from the palette. Each option is a real
 * button with its name visible; the pills sit on surface so they read on every ground.
 * Saves right away, like the photo and specialties.
 */
export function HeroColorPicker({ value, onChange, disabled = false }: {
  value: string | undefined;
  onChange: (color: HeroColor) => void;
  disabled?: boolean;
}) {
  const current = heroColorOf(value).value;

  return (
    <fieldset className="m-0 mt-6 border-0 p-0">
      <legend className="mb-2 p-0 text-[15px] font-semibold text-on-navy">Cor do portfólio</legend>
      <div className="flex flex-wrap gap-2">
        {HERO_COLORS.map((option) => {
          const pressed = option.value === current;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={pressed}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`flex min-h-[44px] items-center gap-2 rounded-pill border-2 border-ink px-3 text-[14px] font-semibold text-ink transition-transform duration-[120ms] hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-gold disabled:opacity-60 motion-reduce:transition-none ${pressed ? 'bg-surface font-bold shadow-md' : 'bg-surface'}`}
            >
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 border-ink" style={{ background: option.swatch }} aria-hidden="true">
                {pressed && <Check className={`h-3 w-3 ${option.light ? 'text-ink' : 'text-on-navy'}`} strokeWidth={3.5} />}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
