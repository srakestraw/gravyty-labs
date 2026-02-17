'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.(REDUCED_MOTION_QUERY);
    if (!mq) return;
    setPrefersReduced(mq.matches);
    const handler = () => setPrefersReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

/**
 * Adds shadow to a sticky header when scrollY > threshold.
 */
export function useScrollShadow(ref: React.RefObject<HTMLElement | null>, threshold = 8) {
  const [hasShadow, setHasShadow] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const y = window.scrollY ?? document.documentElement.scrollTop;
      setHasShadow(y > threshold);
    };

    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [ref, threshold]);

  return reduced ? false : hasShadow;
}

export interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

/**
 * Pointer-based swipe detection. Returns transform style and handlers.
 */
export function useSwipeable(
  callbacks: SwipeCallbacks,
  options?: { threshold?: number; disabled?: boolean }
) {
  const threshold = options?.threshold ?? SWIPE_THRESHOLD;
  const disabled = options?.disabled ?? false;
  const reduced = usePrefersReducedMotion();

  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const deltaRef = useRef({ x: 0, y: 0 });
  const [delta, setDelta] = useState({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || reduced) return;
      start.current = { x: e.clientX, y: e.clientY, t: Date.now() };
      deltaRef.current = { x: 0, y: 0 };
      setDelta({ x: 0, y: 0 });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [disabled, reduced]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!start.current || disabled || reduced) return;
      const d = {
        x: e.clientX - start.current.x,
        y: e.clientY - start.current.y,
      };
      deltaRef.current = d;
      setDelta(d);
    },
    [disabled, reduced]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!start.current || disabled || reduced) return;
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      const d = deltaRef.current;
      const dt = Date.now() - start.current.t;
      const vx = Math.abs(d.x) / Math.max(dt, 1);
      const vy = Math.abs(d.y) / Math.max(dt, 1);

      if (Math.abs(d.x) > threshold || vx > SWIPE_VELOCITY_THRESHOLD) {
        if (d.x > 0) callbacks.onSwipeRight?.();
        else callbacks.onSwipeLeft?.();
      } else if (Math.abs(d.y) > threshold || vy > SWIPE_VELOCITY_THRESHOLD) {
        if (d.y > 0) callbacks.onSwipeDown?.();
        else callbacks.onSwipeUp?.();
      }

      start.current = null;
      deltaRef.current = { x: 0, y: 0 };
      setDelta({ x: 0, y: 0 });
    },
    [callbacks, disabled, reduced, threshold]
  );

  const transform =
    reduced || disabled
      ? undefined
      : `translate(${delta.x}px, ${delta.y}px) rotate(${delta.x * 0.03}deg)`;

  return {
    style: transform ? { transform } : undefined,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: () => {
      start.current = null;
      setDelta({ x: 0, y: 0 });
    },
    delta,
  };
}

/**
 * Triggers a transient CSS class for micro-animations (pulse, confetti state).
 * Returns [trigger, isActive]. Call trigger() to start the animation.
 */
export function useMicroAnimation(durationMs = 600) {
  const [active, setActive] = useState(false);
  const reduced = usePrefersReducedMotion();

  const trigger = useCallback(() => {
    if (reduced) return;
    setActive(true);
    const id = window.setTimeout(() => setActive(false), durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs, reduced]);

  return [trigger, active] as const;
}
