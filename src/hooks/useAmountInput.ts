import { useState } from 'react';

// Shared keypad-driven amount entry (Add funds / Trade / Withdraw).
export function useAmountInput(maxDecimals = 2, maxDigits = 9) {
  const [raw, setRaw] = useState('');

  const onKey = (k: string) => {
    setRaw((prev) => {
      if (k === '<') return prev.slice(0, -1);
      if (k === '.') {
        if (maxDecimals === 0 || prev.includes('.')) return prev;
        return prev === '' ? '0.' : prev + '.';
      }
      if (prev === '0') return k;
      const dec = prev.split('.')[1];
      if (dec !== undefined && dec.length >= maxDecimals) return prev;
      if (prev.replace('.', '').length >= maxDigits) return prev;
      return prev + k;
    });
  };

  const value = parseFloat(raw) || 0;
  return { raw, value, onKey, setRaw };
}
