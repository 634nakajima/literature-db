// Heart-shaped pixel logo matching the lab's colorful heart icon
// 7x7 grid, null = empty cell

const HEART = [
  // row 0 (top)
  [null, '#c8e6c9', null, null, null, '#e1bee7', null],
  // row 1
  ['#fce4cc', '#fde9b0', '#c5e1a5', null, '#bbdefb', '#d1c4e9', '#ce93d8'],
  // row 2
  ['#f8bbd0', '#ffcc80', '#ffe082', '#81c784', '#b0bec5', '#64b5f6', '#9575cd'],
  // row 3
  ['#f8bbd0', '#f48fb1', '#ffab91', '#ffd54f', '#4caf50', '#00838f', '#1565c0'],
  // row 4
  [null, '#ef5350', '#ff7043', '#fbc02d', '#2e7d32', null, null],
  // row 5
  [null, null, '#d32f2f', '#e65100', null, null, null],
  // row 6 (bottom)
  [null, null, null, '#b71c1c', null, null, null],
];

export default function HeartLogo({ size = 36 }) {
  const cols = 7;
  const rows = 7;
  const cellSize = size / cols;
  const gap = cellSize * 0.08;
  const r = cellSize * 0.2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {HEART.map((row, y) =>
        row.map((color, x) => {
          if (!color) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize + gap}
              y={y * cellSize + gap}
              width={cellSize - gap * 2}
              height={cellSize - gap * 2}
              rx={r}
              ry={r}
              fill={color}
            />
          );
        })
      )}
    </svg>
  );
}
