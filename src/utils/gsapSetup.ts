import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin once globally
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/**
 * Check if the user's OS has prefers-reduced-motion enabled.
 */
export const isReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Utility for scroll-triggered entrance animations (opacity 0 -> 1, y 30 -> 0).
 */
export const initScrollReveal = (
  element: HTMLElement | string,
  options?: {
    y?: number;
    duration?: number;
    delay?: number;
    stagger?: number;
    trigger?: HTMLElement | string;
    start?: string;
  }
) => {
  if (typeof window === 'undefined') return;

  // Verify target element exists in DOM before triggering GSAP to avoid console warnings
  if (typeof element === 'string') {
    if (!element.trim() || !document.querySelector(element)) return;
  } else if (!element) {
    return;
  }

  if (isReducedMotion()) {
    gsap.set(element, { opacity: 1, y: 0 });
    return;
  }

  const {
    y = 30,
    duration = 0.7,
    delay = 0,
    stagger = 0.08,
    trigger = element,
    start = 'top 85%',
  } = options || {};

  if (typeof trigger === 'string') {
    if (!trigger.trim() || !document.querySelector(trigger)) return;
  }

  return gsap.fromTo(
    element,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      stagger,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: trigger as string | Element,
        start,
        once: true,
      },
    }
  );
};
