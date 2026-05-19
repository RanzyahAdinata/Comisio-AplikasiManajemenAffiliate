export default function SalesChart() {
  // Monthly data points simulating the wave pattern in Figma
  const data = [18, 28, 22, 35, 25, 42, 30, 38, 45, 32, 50, 38];
  const labels = ["Jan 2026", "", "", "", "", "", "", "", "", "", "", "Apr 2026"];

  const width = 380;
  const height = 110;
  const padding = { top: 10, right: 10, bottom: 24, left: 10 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data) + 5;
  const minVal = 0;

  const getX = (i) => padding.left + (i / (data.length - 1)) * chartW;
  const getY = (v) => padding.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  // Build smooth path
  const points = data.map((v, i) => [getX(i), getY(v)]);

  let linePath = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const cpX = (x0 + x1) / 2;
    linePath += ` C ${cpX} ${y0}, ${cpX} ${y1}, ${x1} ${y1}`;
  }

  const areaPath = linePath + ` L ${points[points.length - 1][0]} ${padding.top + chartH} L ${points[0][0]} ${padding.top + chartH} Z`;

  // Find peak point (index 10 ~ Apr)
  const peakIdx = data.indexOf(Math.max(...data));

  return (
    <div className="chart-svg-wrap">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E5183B" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#E5183B" stopOpacity="0.02"/>
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill="url(#salesGrad)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#E5183B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Dashed vertical at peak */}
        <line
          x1={points[peakIdx][0]} y1={padding.top}
          x2={points[peakIdx][0]} y2={padding.top + chartH}
          stroke="#E5183B" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"
        />

        {/* Peak dot */}
        <circle cx={points[peakIdx][0]} cy={points[peakIdx][1]} r="5" fill="white" stroke="#E5183B" strokeWidth="2"/>

        {/* X-axis labels */}
        <text x={padding.left} y={height - 4} fontSize="9" fill="#aaa" fontFamily="Montserrat, sans-serif">Jan 2026</text>
        <text x={width - padding.right} y={height - 4} fontSize="9" fill="#aaa" fontFamily="Montserrat, sans-serif" textAnchor="end">Apr 2026</text>
      </svg>
    </div>
  );
}
