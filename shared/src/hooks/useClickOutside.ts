import { useEffect, RefObject } from 'react';

/**
 * Custom hook that handles clicking outside of a referenced element
 * @param ref - React ref object pointing to the element to detect clicks outside of
 * @param handler - Function to call when a click outside is detected
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent) => void,
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};
