// Plain SVG, not lightweight-charts, that's overkill for something this small.
export function Sparkline({ points, up, width = 110, height = 32 }) {
  if (!points || points.length < 2) {
    return <div style={{ width, height }} className="text-xs text-text-muted flex items-center">No data</div>;
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);

  const d = values
    .map((v, i) => {
      const x = (i * step).toFixed(2);
      const y = (height - ((v - min) / range) * height).toFixed(2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const color = up ? "var(--gain)" : "var(--loss)";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
