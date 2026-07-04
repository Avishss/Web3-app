import React from 'react';
import Svg, { Polyline } from 'react-native-svg';

interface Props {
  data: number[];
  width?: number;
  height?: number;
  color: string;
  strokeWidth?: number;
}

export default function Sparkline({ data, width = 64, height = 28, color, strokeWidth = 1.8 }: Props) {
  if (data.length < 2) return <Svg width={width} height={height} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = strokeWidth;
  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
