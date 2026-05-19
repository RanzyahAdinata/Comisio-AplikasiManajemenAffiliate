export default function ReputationChart() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const values = [86.14, 88.26, 83.26, 91.54, 88.0, 84.0];
  const maxVal = 100;

  const barWidth = 28;
  const gap = 18;
  const chartH = 90;
  const totalW = days.length * (barWidth + gap) - gap + 20;
  const labelY = chartH + 18;

  const peakIdx = values.indexOf(Math.max(...values)); // Thursday = 3

  return (
    <div className="chart-svg-wrap">
      <svg width="100%" viewBox={`0 0 ${totalW + 20} ${chartH + 30}`} preserveAspectRatio="xMidYMid meet">
        {days.map((day, i) => {
          const barH = (values[i] / maxVal) * chartH;
          const x = 10 + i * (barWidth + gap);
          const y = chartH - barH;
          const isPeak = i === peakIdx;

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x} y={y}
                width={barWidth} height={barH}
                rx="6" ry="6"
                fill={isPeak ? "#E5183B" : "#E0E0E0"}
              />
              {/* Value label on top */}
              <text
                x={x + barWidth / 2} y={y - 5}
                textAnchor="middle" fontSize="8"
                fill={isPeak ? "#E5183B" : "#aaa"}
                fontWeight={isPeak ? "700" : "400"}
                fontFamily="Montserrat, sans-serif"
              >
                {values[i]}
              </text>
              {/* Day label */}
              <text
                x={x + barWidth / 2} y={labelY + 6}
                textAnchor="middle" fontSize="7.5"
                fill="#aaa"
                fontFamily="Montserrat, sans-serif"
              >
                {day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
