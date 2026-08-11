import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  fill?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 120,
  height = 40,
  strokeWidth = 2,
  color = '#c9a86c',
  fill = true,
  className = '',
}: SparklineProps) {
  const pathD = useMemo(() => {
    if (data.length < 2) return '';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = data.map((val, i) => ({
      x: padding + (i / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - ((val - min) / range) * chartHeight,
    }));
    
    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
    
    if (!fill) return linePath;
    
    // Close the path for fill
    const last = points[points.length - 1];
    const first = points[0];
    return `${linePath} L ${last.x} ${height} L ${first.x} ${height} Z`;
  }, [data, width, height]);
  
  const isPositive = data.length >= 2 && data[data.length - 1] >= data[0];
  const trendColor = color === '#c9a86c' 
    ? (isPositive ? '#7a9e7e' : '#c45b5a')
    : color;

  if (!pathD) {
    return (
      <svg width={width} height={height} className={className}>
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="#7a7569" fontSize="10">
          No data
        </text>
      </svg>
    );
  }

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      {fill && (
        <path
          d={pathD}
          fill={`${trendColor}20`}
          stroke="none"
        />
      )}
      <path
        d={pathD}
        fill="none"
        stroke={trendColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {data.length >= 2 && (
        <circle
          cx={width - 2}
          cy={(() => {
            const min = Math.min(...data);
            const max = Math.max(...data);
            const range = max - min || 1;
            const chartHeight = height - 4;
            return 2 + chartHeight - ((data[data.length - 1] - min) / range) * chartHeight;
          })()}
          r={3}
          fill={trendColor}
          stroke="#0c0c0e"
          strokeWidth={1}
        />
      )}
    </svg>
  );
}
