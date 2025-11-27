"use client"

interface TriangleChartProps {
  pdi: number
  jdi: number
  ihi: number
  size?: number
}

export function TriangleChart({ pdi, jdi, ihi, size = 120 }: TriangleChartProps) {
  // Normalize values to 0-1 range
  const normalizedPDI = pdi / 100
  const normalizedJDI = jdi / 100
  const normalizedIHI = ihi / 100

  // Triangle coordinates (equilateral triangle, pointing up)
  const height = size * 0.866 // sin(60°) * size
  const top = { x: size / 2, y: 10 }
  const left = { x: 10, y: height }
  const right = { x: size - 10, y: height }

  // Calculate point position based on scores
  // Using barycentric coordinates
  const pointX = left.x * normalizedPDI + right.x * normalizedJDI + top.x * normalizedIHI
  const pointY = left.y * normalizedPDI + right.y * normalizedJDI + top.y * normalizedIHI

  return (
    <svg width={size} height={height + 10} className="overflow-visible">
      {/* Triangle outline */}
      <polygon
        points={`${top.x},${top.y} ${left.x},${left.y} ${right.x},${right.y}`}
        fill="none"
        stroke="oklch(0.30 0 0)"
        strokeWidth="1.5"
      />

      {/* Subtle fill */}
      <polygon
        points={`${top.x},${top.y} ${left.x},${left.y} ${right.x},${right.y}`}
        fill="oklch(0.25 0 0)"
        opacity="0.3"
      />

      {/* Grid lines */}
      <line
        x1={top.x}
        y1={top.y}
        x2={pointX}
        y2={pointY}
        stroke="oklch(0.63 0.20 290)"
        strokeWidth="1"
        opacity="0.3"
        strokeDasharray="2,2"
      />
      <line
        x1={left.x}
        y1={left.y}
        x2={pointX}
        y2={pointY}
        stroke="oklch(0.60 0.18 240)"
        strokeWidth="1"
        opacity="0.3"
        strokeDasharray="2,2"
      />
      <line
        x1={right.x}
        y1={right.y}
        x2={pointX}
        y2={pointY}
        stroke="oklch(0.65 0.15 150)"
        strokeWidth="1"
        opacity="0.3"
        strokeDasharray="2,2"
      />

      {/* Center point */}
      <circle cx={pointX} cy={pointY} r="4" fill="oklch(0.70 0.15 265)" stroke="oklch(0.12 0 0)" strokeWidth="2" />

      {/* Corner labels */}
      <text x={top.x} y={top.y - 8} textAnchor="middle" className="fill-ihi text-[10px] font-medium">
        IHI
      </text>
      <text x={left.x - 8} y={left.y + 4} textAnchor="end" className="fill-pdi text-[10px] font-medium">
        PDI
      </text>
      <text x={right.x + 8} y={right.y + 4} textAnchor="start" className="fill-jdi text-[10px] font-medium">
        JDI
      </text>
    </svg>
  )
}
