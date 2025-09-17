"use client";

import { useRef, useCallback } from "react";

export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const debouncedCallback = useCallback(
    (...args) => {
      clearTimer();
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        timeoutRef.current = null;
      }, delay);
    },
    [callback, delay]
  );

  debouncedCallback.cancel = () => {
    clearTimer();
  };

  const cleanup = useCallback(() => {
    clearTimer();
  }, []);

  return { debouncedCallback, cleanup };
};
