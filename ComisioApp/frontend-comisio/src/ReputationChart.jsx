export default function ReputationChart({ 
  days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], 
  values = [86, 88, 83, 92, 88, 84] 
}) {
  const maxVal = Math.max(100, ...values);
  const BAR_W = 22;
  const GAP = 10;
  const CHART_H = 60;
  const TOP_PAD = 12; // prevent text clipping at y=0
  const PAD_X = 2;
  const DOT_Y_OFFSET = 12; // extra space between dot and label
  const LABEL_H = 24;
  const totalW = days.length * (BAR_W + GAP) - GAP + PAD_X * 2;
  const svgH = TOP_PAD + CHART_H + DOT_Y_OFFSET + LABEL_H;

  const peakIdx = values.lastIndexOf(Math.max(...values));
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
          <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E5183B" stopOpacity="1" />
            <stop offset="100%" stopColor="#E5183B" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8C8C8" stopOpacity="1" />
            <stop offset="100%" stopColor="#DEDEDE" stopOpacity="0.6" />
          </linearGradient>
          <filter id="peakGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#E5183B" floodOpacity="0.3" />
          </filter>
        </defs>

        {days.map((_, i) => {
          const rawH = (values[i] / maxVal) * CHART_H;
          const barH = Math.max(rawH, 8);
          const x = PAD_X + i * (BAR_W + GAP);
          const y = TOP_PAD + CHART_H - barH;
          const isPeak = i === peakIdx;

          return (
            <g key={i}>
              {/* Track background */}
              <rect
                x={x} y={TOP_PAD}
                width={BAR_W} height={CHART_H}
                rx={10} ry={10}
                fill={isPeak ? "#fce8ec" : "#EFEFEF"}
              />

              {/* Bar */}
              <rect
                x={x} y={y}
                width={BAR_W} height={barH}
                rx={10} ry={10}
                fill={isPeak ? "url(#peakGrad)" : "url(#normalGrad)"}
                filter={isPeak ? "url(#peakGlow)" : undefined}
              />

              {/* Value on top */}
              <text
                x={x + BAR_W / 2} y={y - 4}
                textAnchor="middle"
                fontSize="6.5"
                fontWeight={isPeak ? "700" : "500"}
                fill={isPeak ? "#E5183B" : "#A0A0A0"}
                fontFamily="Inter, sans-serif"
              >
                {values[i]}
              </text>

              {/* Dot indicator for peak — placed with extra gap above label */}
              {isPeak && (
                <circle
                  cx={x + BAR_W / 2}
                  cy={TOP_PAD + CHART_H + DOT_Y_OFFSET - 6}
                  r={3}
                  fill="#E5183B"
                />
              )}

              {/* Day label */}
              <text
                x={x + BAR_W / 2}
                y={TOP_PAD + CHART_H + DOT_Y_OFFSET + LABEL_H - 8}
                textAnchor="middle"
                fontSize="6.5"
                fontWeight={isPeak ? "700" : "400"}
                fill={isPeak ? "#E5183B" : "#BDBDBD"}
                fontFamily="Inter, sans-serif"
              >
                {shortDays[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
