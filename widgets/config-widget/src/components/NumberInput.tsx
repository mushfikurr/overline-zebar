import { Input } from '@overline-zebar/ui';
import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';

interface NumberInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: number;
  onChange: (newValue: number) => void;
  debounceMs?: number;
}

export function NumberInput({
  value,
  onChange,
  debounceMs = 500,
  ...props
}: NumberInputProps) {
  const [internalValue, setInternalValue] = useState(String(value));
  const [debouncedValue] = useDebounce(internalValue, debounceMs);

  // Latest values/handler kept in a ref so the unmount flush can commit
  // pending edits without a stale closure.
  const latestRef = useRef({ internalValue, value, onChange });
  latestRef.current = { internalValue, value, onChange };

  // Effect to sync from parent (external changes)
  useEffect(() => {
    if (parseInt(internalValue, 10) !== value) {
      setInternalValue(String(value));
    }
  }, [value]);

  // Effect to commit debounced changes to parent
  useEffect(() => {
    const numericValue = parseInt(debouncedValue, 10);
    if (!isNaN(numericValue) && numericValue !== value) {
      onChange(numericValue);
    }
  }, [debouncedValue]);

  // Flush any pending edit when the input unmounts (e.g. the config
  // widget is closed right after typing).
  useEffect(() => {
    return () => {
      const { internalValue: latest, value: latestValue } = latestRef.current;
      const numericValue = parseInt(latest, 10);
      if (!isNaN(numericValue) && numericValue !== latestValue) {
        latestRef.current.onChange(numericValue);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleBlur = () => {
    const numericValue = parseInt(internalValue, 10);
    if (isNaN(numericValue)) {
      // If the user leaves the input in an invalid state, revert it.
      setInternalValue(String(value));
      return;
    }
    // Commit pending edits immediately on blur instead of waiting for
    // the debounce to elapse.
    if (numericValue !== value) {
      onChange(numericValue);
    }
  };

  return (
    <Input
      {...props}
      type="number"
      value={internalValue}
      className="h-full"
      onChange={handleInputChange}
      onBlur={handleBlur}
    />
  );
}
