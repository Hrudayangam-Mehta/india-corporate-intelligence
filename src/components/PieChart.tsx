import React from 'react';

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieSlice[];
  size?: number;
  donut?: boolean;
  showLegend?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  size = 280, 
  donut = true,
  showLegend = true 
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const center = size / 2;
  const radius = (size - 40) / 2;
  const innerRadius = donut ? radius * 0.55 : 0;

  let currentAngle = -Math.PI / 2; // Start at top

  const slices = data.map(slice => {
    const angle = (slice.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calculate path
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    let path = '';
    if (donut) {
      const ix1 = center + innerRadius * Math.cos(startAngle);
      const iy1 = center + innerRadius * Math.sin(startAngle);
      const ix2 = center + innerRadius * Math.cos(endAngle);
      const iy2 = center + innerRadius * Math.sin(endAngle);

      path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} ` +
             `L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    } else {
      path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }

    // Label position (middle of slice)
    const midAngle = startAngle + angle / 2;
    const labelRadius = donut ? (radius + innerRadius) / 2 : radius * 0.7;
    const lx = center + labelRadius * Math.cos(midAngle);
    const ly = center + labelRadius * Math.sin(midAngle);

    return { ...slice, path, lx, ly, percent: (slice.value / total) * 100 };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice) => (
          <g key={slice.label}>
            <path
              d={slice.path}
              fill={slice.color}
              stroke="#161618"
              strokeWidth={2}
              className="transition-all hover:opacity-80 cursor-pointer"
            />
            {slice.percent > 5 && (
              <text
                x={slice.lx}
                y={slice.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-semibold pointer-events-none"
                fill="white"
              >
                {slice.percent.toFixed(0)}%
              </text>
            )}
          </g>
        ))}
        {donut && (
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-bold"
            fill="#c9a86c"
          >
            {total.toFixed(0)}%
          </text>
        )}
      </svg>

      {showLegend && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 w-full">
          {data.map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-[#9c9588] truncate">{item.label}</span>
              <span className="text-xs text-[#f0e6d8] ml-auto">{item.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
