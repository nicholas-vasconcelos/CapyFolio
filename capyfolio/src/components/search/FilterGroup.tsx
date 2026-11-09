import { useId } from 'react';
import type { FacetOption } from '../../lib/facetedSearch';
import { ShowAllToggle } from './ShowAllToggle';
import { useCollapsedOptions } from './useCollapsedOptions';

/** A fieldset of checkboxes, each with how many people have that value. Shows three until expanded. */
export function FilterGroup({ legend, options, selected, allLabel = 'Ver todos', onToggle }: {
  legend: string;
  options: FacetOption[];
  selected: string[];
  allLabel?: string;
  onToggle: (value: string) => void;
}) {
  const listId = useId();
  const { visible, expanded, collapsible, toggle } = useCollapsedOptions(options, selected);
  if (!options.length) return null;
  return (
    <fieldset className="m-0 flex flex-col border-0 p-0">
      <legend className="mb-1.5 p-0 font-display text-lg font-bold">{legend}</legend>
      <div id={listId} className="flex flex-col">
        {visible.map((option) => (
          <label key={option.value} className="cf-check">
            <input type="checkbox" checked={selected.includes(option.value)} onChange={() => onToggle(option.value)} />
            <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{option.label}</span>
            <span className="n">{option.count}</span>
          </label>
        ))}
      </div>
      {collapsible && <ShowAllToggle expanded={expanded} total={options.length} allLabel={allLabel} controls={listId} onToggle={toggle} />}
    </fieldset>
  );
}
