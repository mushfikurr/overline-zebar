import { Input } from '@overline-zebar/ui';
import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';

interface CoordinateInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: number | null;
  onChange: (newValue: number | null) => void;
  min: number;
  max: number;
  debounceMs?: number;
}

export function CoordinateInput({
  value,
  onChange,
  min,
  max,
  debounceMs = 500,
  ...props
}: CoordinateInputProps) {
  const [internalValue, setInternalValue] = useState(
    value === null ? '' : String(value)
  );
  const [debouncedValue] = useDebounce(internalValue, debounceMs);

  const latestRef = useRef({ internalValue, value, onChange });
  latestRef.current = { internalValue, value, onChange };

  const parse = (input: string) => {
    const numericValue = parseFloat(input);
    if (isNaN(numericValue) || numericValue < min || numericValue > max) {
      return null;
    }
    return numericValue;
  };

  useEffect(() => {
    if (parseFloat(internalValue) !== value) {
      setInternalValue(value === null ? '' : String(value));
    }
  }, [value]);

  useEffect(() => {
    if (debouncedValue === '') {
      if (value !== null) {
        onChange(null);
      }
      return;
    }
    const numericValue = parse(debouncedValue);
    if (numericValue !== null && numericValue !== value) {
      onChange(numericValue);
    }
  }, [debouncedValue]);

  useEffect(() => {
    return () => {
      const { internalValue: latest, value: latestValue } = latestRef.current;
      if (latest === '') {
        if (latestValue !== null) {
          latestRef.current.onChange(null);
        }
        return;
      }
      const numericValue = parse(latest);
      if (numericValue !== null && numericValue !== latestValue) {
        latestRef.current.onChange(numericValue);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleBlur = () => {
    if (internalValue === '') {
      if (value !== null) {
        onChange(null);
      }
      return;
    }
    const numericValue = parse(internalValue);
    if (numericValue === null) {
      setInternalValue(value === null ? '' : String(value));
      return;
    }
    if (numericValue !== value) {
      onChange(numericValue);
    }
  };

  const invalid = internalValue !== '' && parse(internalValue) === null;

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      aria-invalid={invalid || undefined}
      value={internalValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
    />
  );
}
