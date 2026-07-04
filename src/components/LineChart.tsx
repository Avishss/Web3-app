import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  data: number[];
  height?: number;
  color: string;
  onScrub?: (index: number | null) => void;
}

// Touch-scrubbable price chart: drag anywhere to inspect a point, release to
// return to live. Pure view-responder implementation — no gesture deps.
export default function LineChart({ data, height = 220, color, onScrub }: Props) {
  const [width, setWidth] = useState(0);
  const [scrubIdx, setScrubIdx] = useState<number | null>(null);

  const { linePath, fillPath, toXY } = useMemo(() => {
    if (data.length < 2 || width === 0)
      return { linePath: '', fillPath: '', toXY: (_: number) => ({ x: 0, y: 0 }) };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const padY = 12;
    const toXY = (i: number) => ({
      x: (i / (data.length - 1)) * width,
      y: padY + (1 - (data[i] - min) / span) * (height - padY * 2),
    });
    let d = '';
    for (let i = 0; i < data.length; i++) {
      const { x, y } = toXY(i);
      d += i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    const fill = `${d} L${width} ${height} L0 ${height} Z`;
    return { linePath: d, fillPath: fill, toXY };
  }, [data, width, height]);

  const setScrub = (idx: number | null) => {
    setScrubIdx(idx);
    onScrub?.(idx);
  };

  const handleTouch = (locationX: number) => {
    if (width === 0 || data.length < 2) return;
    const idx = Math.round((locationX / width) * (data.length - 1));
    setScrub(Math.max(0, Math.min(data.length - 1, idx)));
  };

  const scrubPoint = scrubIdx !== null ? toXY(scrubIdx) : null;

  return (
    <View
      style={{ height }}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => handleTouch(e.nativeEvent.locationX)}
      onResponderMove={(e) => handleTouch(e.nativeEvent.locationX)}
      onResponderRelease={() => setScrub(null)}
      onResponderTerminate={() => setScrub(null)}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.22} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {!!fillPath && <Path d={fillPath} fill="url(#chartFill)" />}
          {!!linePath && (
            <Path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth={2.4}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {scrubPoint && (
            <>
              <Line
                x1={scrubPoint.x}
                y1={0}
                x2={scrubPoint.x}
                y2={height}
                stroke={colors.textFaint}
                strokeWidth={1}
                strokeDasharray="3 4"
              />
              <Circle cx={scrubPoint.x} cy={scrubPoint.y} r={7} fill={`${color}33`} />
              <Circle cx={scrubPoint.x} cy={scrubPoint.y} r={4} fill={color} />
            </>
          )}
        </Svg>
      )}
    </View>
  );
}
