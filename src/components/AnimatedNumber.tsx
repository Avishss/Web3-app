import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

export function useTweenedValue(target: number, duration = 500): number {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);

  useEffect(() => {
    const from = valueRef.current;
    if (from === target) return;
    const start = Date.now();
    let raf = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (target - from) * eased;
      valueRef.current = v;
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

interface Props {
  value: number;
  format: (v: number) => string;
  style?: StyleProp<TextStyle>;
  duration?: number;
}

// Number text that glides to its new value instead of jumping.
export default function AnimatedNumber({ value, format, style, duration }: Props) {
  const tweened = useTweenedValue(value, duration);
  return (
    <Text style={style} numberOfLines={1} adjustsFontSizeToFit>
      {format(tweened)}
    </Text>
  );
}
