import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Opens every new page at the top. Without it the router keeps the old scroll position,
 * so a project clicked halfway down the feed opened halfway down its own page.
 * Back and forward (POP) are left alone; only the path counts, so filters in the query
 * string do not jump the page.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === 'POP') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, navigationType]);

  return null;
}
