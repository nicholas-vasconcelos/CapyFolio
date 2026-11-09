import { useState } from 'react';
import type { FacetOption } from '../../lib/facetedSearch';

const COLLAPSED_COUNT = 3;

/**
 * Collapses a filter group to its first few options. Selected options always stay visible,
 * so collapsing never hides an active filter.
 */
export function useCollapsedOptions(options: FacetOption[], selected: string[]) {
  const [expanded, setExpanded] = useState(false);
  const collapsible = options.length > COLLAPSED_COUNT;
  const visible = expanded || !collapsible ? options : options.filter((o, i) => i < COLLAPSED_COUNT || selected.includes(o.value));
  return { visible, expanded, collapsible, toggle: () => setExpanded((v) => !v) };
}
