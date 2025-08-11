import { Input } from '@overline-zebar/ui';
import React, { useState, useEffect } from 'react';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleBlur = () => {
    const numericValue = parseInt(internalValue, 10);
    if (isNaN(numericValue)) {
      // If the user leaves the input in an invalid state, revert it.
      setInternalValue(String(value));
    }
  };

  return (
    <Input
      {...props}
      type="number"
      value={internalValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
    />
  );
}
