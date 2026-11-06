import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { GripVertical } from 'lucide-react';
import type { WidgetInstance } from '../../../types';
import { fmt, t } from '../../../i18n';
import { WIDGET_SPECS } from '../../../widgets/specs';
import type { LayoutEditor } from './useLayoutEditor';

/*
 * Drag handle that reorders a grid widget. No library: pointer events cover mouse,
 * pen and touch, and the grid reorders live under the pointer. The same handle works
 * from the keyboard (Space to pick up, arrows to move, Space to drop, Esc to cancel);
 * a keyboard pick-up is shown with a gold outline, a pointer drag by the box itself.
 * Everything from one drag is a single undo step.
 */

const GRID_ITEM = '[data-widget-grid] > [data-widget-id]';
const EDGE = 90; // px from the top, or from the edit bar, where the page scrolls during a drag
const SCROLL_STEP = 14;

/** 1-based position of a widget in the grid as currently drawn. */
function positionOf(id: string) {
  const items = [...document.querySelectorAll<HTMLElement>(GRID_ITEM)];
  return { n: items.findIndex((item) => item.dataset.widgetId === id) + 1, total: items.length };
}

interface DragHandleProps {
  widget: WidgetInstance;
  index: number;
  count: number;
  editor: LayoutEditor;
}

export function DragHandle({ widget, index, count, editor }: DragHandleProps) {
  const id = useId();
  const hintId = useId();
  const label = WIDGET_SPECS[widget.type].label;
  // Keyboard pick-up: where it started (for Esc) and the undo key for this move.
  const [lifted, setLifted] = useState<{ startIndex: number; key: string } | null>(null);
  const disabled = count < 2;

  // During a pointer drag: re-places the floating box. Called after every render,
  // before paint, so the box never flickers when the grid reorders under it.
  const followRef = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    followRef.current?.();
  });

  // Reordering moves DOM nodes, which can drop focus; put it back on the handle once
  // React has re-rendered. A timeout, not requestAnimationFrame, so it also runs in
  // tabs that are not painting.
  const afterRender = (run: () => void) => window.setTimeout(run, 0);
  const refocus = () => afterRender(() => document.getElementById(id)?.focus());

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (lifted) {
        setLifted(null);
        editor.announce(fmt(t.announce.dropped, { label, n: index + 1, total: count }));
      } else {
        setLifted({ startIndex: index, key: `keys:${widget.id}:${event.timeStamp}` });
        editor.announce(fmt(t.announce.pickedUp, { label, n: index + 1, total: count }));
      }
      return;
    }
    if (!lifted) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      editor.moveToIndex(widget.id, lifted.startIndex, lifted.key);
      setLifted(null);
      editor.announce(fmt(t.announce.moveCancelled, { label, n: lifted.startIndex + 1, total: count }));
      refocus();
      return;
    }

    const direction = event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : 0;
    if (direction === 0) return;
    event.preventDefault();
    const next = index + direction;
    if (next < 0 || next >= count) return;
    editor.moveBy(widget.id, direction, lifted.key);
    editor.announce(fmt(t.announce.position, { label, n: next + 1, total: count }));
    refocus();
  };

  // Leaving the handle while picked up drops the widget where it is. Checked a moment
  // later, because a reorder can blur the handle just before refocus puts focus back.
  const onBlur = () => {
    if (!lifted) return;
    window.setTimeout(() => {
      if (document.activeElement?.id !== id) setLifted(null);
    }, 100);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || lifted || event.button !== 0) return;
    const section = event.currentTarget.closest<HTMLElement>('[data-widget-id]');
    if (!section) return;
    event.preventDefault();

    const key = `drag:${widget.id}:${event.timeStamp}`;
    const startIndex = index;
    let x = event.clientX;
    let y = event.clientY;
    // The widget last moved onto. Skipped until the pointer leaves it, so two
    // widgets of different sizes cannot swap back and forth under a still pointer.
    let lastTarget: string | null = null;
    let frame = 0;

    /*
     * The widget follows the pointer. Its slot in the grid still moves as the order
     * changes (that gap is where it will land), so each update works out where the
     * slot is now and offsets the box from there. Page coordinates keep it under
     * the pointer while the page scrolls.
     */
    const startRect = section.getBoundingClientRect();
    const grab = {
      left: startRect.left + window.scrollX,
      top: startRect.top + window.scrollY,
      x: x + window.scrollX,
      y: y + window.scrollY,
    };
    let offsetX = 0;
    let offsetY = 0;
    const follow = () => {
      const rect = section.getBoundingClientRect();
      const slotLeft = rect.left + window.scrollX - offsetX;
      const slotTop = rect.top + window.scrollY - offsetY;
      offsetX = grab.left + (x + window.scrollX - grab.x) - slotLeft;
      offsetY = grab.top + (y + window.scrollY - grab.y) - slotTop;
      section.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    };

    followRef.current = follow;

    // While dragged: above everything else (but under the catalogue), and invisible
    // to hit-testing so the pointer "sees" the widgets underneath it.
    section.style.transition = 'none';
    section.style.zIndex = '40';
    section.style.pointerEvents = 'none';
    section.style.willChange = 'transform';
    section.style.cursor = 'grabbing';
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    const hitTest = () => {
      const hit = document.elementFromPoint(x, y)?.closest<HTMLElement>(GRID_ITEM);
      const targetId = hit?.dataset.widgetId;
      if (!targetId || targetId === widget.id) {
        lastTarget = null;
        return;
      }
      if (targetId === lastTarget) return;
      lastTarget = targetId;
      editor.moveOnto(widget.id, targetId, key);
    };

    // Scroll the page while the pointer is near the top or the edit bar.
    const autoScroll = () => {
      const bottomEdge = (document.querySelector('[data-edit-bar]')?.getBoundingClientRect().top ?? window.innerHeight) - EDGE;
      if (y < EDGE) {
        window.scrollBy(0, -SCROLL_STEP);
        hitTest();
        follow();
      } else if (y > bottomEdge) {
        window.scrollBy(0, SCROLL_STEP);
        hitTest();
        follow();
      }
      frame = requestAnimationFrame(autoScroll);
    };
    frame = requestAnimationFrame(autoScroll);

    const onMove = (moveEvent: PointerEvent) => {
      x = moveEvent.clientX;
      y = moveEvent.clientY;
      follow();
      hitTest();
    };

    const finish = (cancelled: boolean) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('keydown', onKey, true);
      cancelAnimationFrame(frame);
      followRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (cancelled) editor.moveToIndex(widget.id, startIndex, key);

      afterRender(() => {
        // Settle into the slot: a short slide (same 120ms as hover lifts), none with reduced motion.
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        section.style.pointerEvents = '';
        section.style.willChange = '';
        section.style.cursor = '';
        section.style.transition = reduceMotion ? '' : 'transform 120ms ease-out';
        section.style.transform = '';
        window.setTimeout(() => {
          section.style.transition = '';
          section.style.zIndex = '';
        }, reduceMotion ? 0 : 140);

        const { n, total } = positionOf(widget.id);
        editor.announce(fmt(cancelled ? t.announce.moveCancelled : t.announce.dropped, { label, n, total }));
        document.getElementById(id)?.focus();
      });
    };
    const onUp = () => finish(false);
    const onKey = (keyEvent: globalThis.KeyboardEvent) => {
      if (keyEvent.key !== 'Escape') return;
      keyEvent.preventDefault();
      keyEvent.stopPropagation();
      finish(true);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKey, true);
  };

  return (
    <>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-label={fmt(t.editor.dragHandle, { label })}
        aria-describedby={hintId}
        aria-pressed={lifted !== null}
        title={t.editor.dragTooltip}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onPointerDown={onPointerDown}
        data-dragging={lifted !== null ? 'true' : undefined}
        className="flex h-11 w-11 cursor-grab touch-none items-center justify-center rounded-md text-ink hover:bg-navy-tint focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-gold active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent aria-pressed:bg-gold"
      >
        <GripVertical className="h-5 w-5" aria-hidden="true" />
      </button>
      <span id={hintId} className="sr-only">{t.editor.dragHint}</span>
    </>
  );
}
