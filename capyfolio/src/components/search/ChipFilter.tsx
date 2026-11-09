import { useId } from 'react';
import type { FacetOption } from '../../lib/facetedSearch';
import { FilterChip } from './FilterChip';
import { ShowAllToggle } from './ShowAllToggle';
import { useCollapsedOptions } from './useCollapsedOptions';

/** A facet drawn as toggle chips (Especialidades, Temas). Shows three until expanded. */
export function ChipFilter({ legend, allLabel, options, selected, onToggle }: {
  legend: string;
  allLabel: string;
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const listId = useId();
  const { visible, expanded, collapsible, toggle } = useCollapsedOptions(options, selected);
  if (!options.length) return null;
  return (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="mb-3 p-0 font-display text-lg font-bold">{legend}</legend>
      <div id={listId} className="flex flex-wrap gap-2">
        {visible.map((option) => (
          <FilterChip key={option.value} label={option.label} pressed={selected.includes(option.value)} onToggle={() => onToggle(option.value)} />
        ))}
      </div>
      {collapsible && <ShowAllToggle expanded={expanded} total={options.length} allLabel={allLabel} controls={listId} onToggle={toggle} />}
    </fieldset>
  );
}
