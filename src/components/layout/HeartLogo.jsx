// Heart-shaped pixel logo inspired by the lab's colorful heart icon
// Each cell represents a colored square in a heart pattern

const HEART = [
  // row 0: positions 1, 5
  [null, '#c8e6c9', null, null, null, '#e1bee7', null],
  // row 1: positions 0-2, 4-6
  ['#fce4cc', '#fde9b0', '#c5e1a5', null, '#bbdefb', '#d1c4e9', '#e1bee7'],
  // row 2: positions 0-6
  ['#f8bbd0', '#ffcc80', '#ffe082', '#81c784', '#b0bec5', '#64b5f6', '#9575cd'],
  // row 3: positions 0-6
  ['#f8bbd0', '#f48fb1', '#ffab91', '#ffd54f', '#4caf50', '#00838f', '#1565c0'],
  // row 4: positions 1-5
  [null, '#ef5350', '#ff7043', '#fbc02d', '#2e7d32', null, null],
  // row 5: positions 2-4
  [null, null, '#d32f2f', '#e65100', null, null, null],
  // row 6: position 2
  [null, null, '#b71c1c', null, null, null, null],
];

export default function HeartLogo({ size = 32 }) {
  const cellSize = size / 7;
  const r = cellSize * 0.15;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {HEART.map((row, y) =>
        row.map((color, x) => {
          if (!color) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize + cellSize * 0.05}
              y={y * cellSize + cellSize * 0.05}
              width={cellSize * 0.9}
              height={cellSize * 0.9}
              rx={r}
              ry={r}
              fill={color}
              opacity={0.9}
            />
          );
        })
      )}
    </svg>
  );
}
