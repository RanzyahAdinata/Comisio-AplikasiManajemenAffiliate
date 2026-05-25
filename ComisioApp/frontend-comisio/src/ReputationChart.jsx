export default function ReputationChart({ 
  days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], 
  values = [86, 88, 83, 92, 88, 84] 
}) {
  const maxVal = 100;
  const BAR_W = 22;
  const GAP = 16;
  const CHART_H = 80;
  const PADDING_X = 6;
  const LABEL_H = 22;
  const totalW = days.length * (BAR_W + GAP) - GAP + PADDING_X * 2;
  const svgH = CHART_H + LABEL_H + 14;

  const peakIdx = values.indexOf(Math.max(...values));

  // Shorten day names to 3 chars
  const shortDays = days.map(d => (d || "").substring(0, 3));

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg
        width="100%"
        viewBox={`0 0 ${totalW} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        <defs>
          {/* Gradient for peak bar */}
          <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E5183B" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.75" />
          </linearGradient>
          {/* Gradient for normal bars */}
          <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4D4D4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E8E8E8" stopOpacity="0.5" />
          </linearGradient>
          {/* Drop shadow filter for peak */}
          <filter id="peakShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#E5183B" floodOpacity="0.25" />
          </filter>
        </defs>

        {days.map((_, i) => {
          const rawH = (values[i] / maxVal) * CHART_H;
          const barH = Math.max(rawH, 6); // min height of 6px
          const x = PADDING_X + i * (BAR_W + GAP);
          const y = CHART_H - barH;
          const isPeak = i === peakIdx;
          const isToday = i === days.length - 1;

          return (
            <g key={i}>
              {/* Bar track (background) */}
              <rect
                x={x}
                y={0}
                width={BAR_W}
                height={CHART_H}
                rx={8}
                ry={8}
                fill={isPeak ? "#fde8ec" : "#F0F0F0"}
                opacity="0.5"
              />

              {/* Actual bar */}
              <rect
                x={x}
                y={y}
                width={BAR_W}
                height={barH}
                rx={8}
                ry={8}
                fill={isPeak ? "url(#peakGrad)" : "url(#normalGrad)"}
                filter={isPeak ? "url(#peakShadow)" : undefined}
              />

              {/* Value label */}
              <text
                x={x + BAR_W / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="7"
                fontWeight={isPeak ? "700" : "500"}
                fill={isPeak ? "#E5183B" : "#B0B0B0"}
                fontFamily="Inter, Montserrat, sans-serif"
                letterSpacing="0.3"
              >
                {values[i]}
              </text>

              {/* Day label */}
              <text
                x={x + BAR_W / 2}
                y={CHART_H + LABEL_H + 2}
                textAnchor="middle"
                fontSize="7"
                fontWeight={isToday ? "700" : "400"}
                fill={isPeak ? "#E5183B" : "#BDBDBD"}
                fontFamily="Inter, Montserrat, sans-serif"
                letterSpacing="0.2"
              >
                {shortDays[i]}
              </text>

              {/* Dot indicator for peak */}
              {isPeak && (
                <circle
                  cx={x + BAR_W / 2}
                  cy={CHART_H + LABEL_H - 6}
                  r={2.5}
                  fill="#E5183B"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
