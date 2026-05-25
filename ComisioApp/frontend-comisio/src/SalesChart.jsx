export default function SalesChart({ labels, values, year }) {
  const now = new Date();
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Gunakan data dari backend jika tersedia, fallback ke data bulan-bulan yang sudah lewat
  const currentMonth = now.getMonth(); // 0-based
  const currentYear = now.getFullYear();

  const chartLabels = labels && labels.length > 0
    ? labels
    : MONTH_NAMES.slice(0, currentMonth + 1);

  const chartValues = values && values.length > 0
    ? values
    : chartLabels.map(() => 0);

  const chartYear = year || currentYear;

  const W = 340;
  const H = 115;
  const PAD = { top: 16, right: 14, bottom: 30, left: 14 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...chartValues, 1) + 2;
  const minVal = 0;

  const getX = (i) => PAD.left + (i / Math.max(chartValues.length - 1, 1)) * chartW;
  const getY = (v) => PAD.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const points = chartValues.map((v, i) => [getX(i), getY(v)]);

  // Smooth bezier path
  let linePath = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const cpX = (x0 + x1) / 2;
    linePath += ` C ${cpX} ${y0}, ${cpX} ${y1}, ${x1} ${y1}`;
  }

  const baseline = PAD.top + chartH;
  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${baseline} L ${points[0][0]} ${baseline} Z`;

  // Peak = last data point (bulan terakhir = bulan sekarang)
  const peakIdx = points.length - 1;

  // Y-axis guide values
  const yMid = Math.round(maxVal / 2);
  const yTicks = [0, yMid, Math.round(maxVal)];

  const startLabel = `${chartLabels[0]} ${chartYear}`;
  const endLabel = `${chartLabels[chartLabels.length - 1]} ${chartYear}`;

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="salesAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E5183B" stopOpacity="0.22" />
            <stop offset="75%" stopColor="#E5183B" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#E5183B" stopOpacity="0" />
          </linearGradient>
          <filter id="lineShadow" x="-5%" y="-20%" width="110%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#E5183B" floodOpacity="0.2" />
          </filter>
          <clipPath id="chartClip">
            <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH + 2} />
          </clipPath>
        </defs>

        {/* Subtle horizontal grid lines */}
        {yTicks.map((tick, i) => {
          const gy = getY(tick);
          return (
            <line
              key={i}
              x1={PAD.left} y1={gy}
              x2={PAD.left + chartW} y2={gy}
              stroke="#E8E8E8"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area fill */}
        {points.length > 1 && (
          <path d={areaPath} fill="url(#salesAreaGrad)" clipPath="url(#chartClip)" />
        )}

        {/* Line */}
        {points.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke="#E5183B"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#lineShadow)"
          />
        )}

        {/* Vertical dashed at current month (last point) */}
        <line
          x1={points[peakIdx][0]} y1={PAD.top + 4}
          x2={points[peakIdx][0]} y2={baseline}
          stroke="#E5183B"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          opacity="0.4"
        />

        {/* Peak dot — outer ring (halo) */}
        <circle
          cx={points[peakIdx][0]} cy={points[peakIdx][1]}
          r={7} fill="#E5183B" opacity="0.12"
        />
        {/* Peak dot — white center */}
        <circle
          cx={points[peakIdx][0]} cy={points[peakIdx][1]}
          r={4.5} fill="white" stroke="#E5183B" strokeWidth="2"
        />

        {/* X-axis: first month and current month */}
        <text
          x={PAD.left} y={H - 6}
          fontSize="8.5" fill="#C0C0C0"
          fontFamily="Inter, sans-serif" fontWeight="500"
        >
          {startLabel}
        </text>
        <text
          x={W - PAD.right} y={H - 6}
          fontSize="8.5" fill="#C0C0C0"
          textAnchor="end"
          fontFamily="Inter, sans-serif" fontWeight="500"
        >
          {endLabel}
        </text>
      </svg>
    </div>
  );
}
