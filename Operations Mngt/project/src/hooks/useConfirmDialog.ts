import { useState, useCallback } from 'react';

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [callback, setCallback] = useState<() => void>(() => {});

  const onConfirm = useCallback(() => {
    setIsOpen(false);
    callback();
  }, [callback]);

  const confirm = useCallback((cb: () => void) => {
    setCallback(() => cb);
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    setIsOpen,
    onConfirm,
    confirm,
  };
}