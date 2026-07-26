import React, { useMemo, useState } from "react";

// Snake & Ladder board: 10x10 grid, numbers 1-100 arranged in boustrophedon
// (zigzag) order — the same layout as a real board. An SVG polyline is drawn
// through the center of every cell in number order, so you can literally see
// the zigzag path the numbering follows.

const SIZE = 10; // 10x10 board
const CELL = 64; // px, per-cell size used for the SVG path math

export default function SnakeLadderBoard() {
  const [hovered, setHovered] = useState(null);

  // Build the grid: row 0 = bottom row (numbers 1-10), alternating direction
  // each row, which is the classic zigzag / boustrophedon layout.
  const cells = useMemo(() => {
    const grid = [];
    for (let row = 0; row < SIZE; row++) {
      const rowCells = [];
      const isEvenRow = row % 2 === 0; // rows 0,2,4... go left -> right
      for (let col = 0; col < SIZE; col++) {
        const displayCol = isEvenRow ? col : SIZE - 1 - col;
        const number = row * SIZE + col + 1;
        rowCells[displayCol] = { number, row, col: displayCol };
      }
      grid.push(rowCells);
    }
    return grid; // grid[row][col] -> cell, row 0 is bottom visually
  }, []);

  // Flat list ordered 1..100, each with its pixel center, used to draw the
  // zigzag polyline that threads through every cell in sequence.
  const orderedPoints = useMemo(() => {
    const points = [];
    for (let num = 1; num <= SIZE * SIZE; num++) {
      const row = Math.floor((num - 1) / SIZE);
      const isEvenRow = row % 2 === 0;
      const idxInRow = (num - 1) % SIZE;
      const col = isEvenRow ? idxInRow : SIZE - 1 - idxInRow;
      // visual row from top: bottom row (row 0) sits at the bottom of the board
      const visualRow = SIZE - 1 - row;
      points.push({
        num,
        x: col * CELL + CELL / 2,
        y: visualRow * CELL + CELL / 2,
      });
    }
    return points;
  }, []);

  const pathD = useMemo(() => {
    return orderedPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }, [orderedPoints]);

  const boardPx = SIZE * CELL;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-slate-900 p-8">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-slate-100 text-2xl font-semibold tracking-tight">
          Snake &amp; Ladder — Zigzag Path
        </h1>
        <p className="text-slate-400 text-sm">
          Numbers 1–100 flow bottom-left → bottom-right, then reverse each row.
          {hovered ? ` Hovered cell: ${hovered}` : ""}
        </p>

        <div
          className="relative rounded-lg overflow-hidden shadow-2xl"
          style={{ width: boardPx, height: boardPx }}
        >
          {/* Grid cells */}
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${SIZE}, ${CELL}px)`,
              gridTemplateRows: `repeat(${SIZE}, ${CELL}px)`,
            }}
          >
            {[...cells].reverse().map((row, visualRowIdx) =>
              row.map((cell) => {
                const isAlt = (cell.row + cell.col) % 2 === 0;
                return (
                  <div
                    key={cell.number}
                    onMouseEnter={() => setHovered(cell.number)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex items-start justify-start p-1 text-xs font-medium transition-colors ${
                      isAlt
                        ? "bg-slate-100 text-slate-700"
                        : "bg-slate-200 text-slate-700"
                    } hover:bg-amber-200 cursor-default`}
                    style={{ width: CELL, height: CELL }}
                  >
                    {cell.number}
                  </div>
                );
              })
            )}
          </div>

          {/* Zigzag path overlay */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={boardPx}
            height={boardPx}
          >
            <path
              d={pathD}
              fill="none"
              stroke="#dc2626"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0"
              opacity={0.85}
            />
            {orderedPoints
              .filter((p) => p.num === 1 || p.num === 100 || p.num % 10 === 0)
              .map((p) => (
                <circle
                  key={p.num}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill="#dc2626"
                />
              ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
