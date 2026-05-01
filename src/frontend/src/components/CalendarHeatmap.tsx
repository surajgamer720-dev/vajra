import { useMemo, useRef, useState } from "react";
import { cn } from "../lib/utils";

interface CompletionDay {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

interface CalendarHeatmapProps {
  completions: CompletionDay[];
  className?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CELL_SIZE = 11;
const CELL_GAP = 3;
const CELL_STRIDE = CELL_SIZE + CELL_GAP;

interface TooltipState {
  x: number;
  y: number;
  date: string;
  completed: boolean;
  weekIndex: number;
}

function buildWeeks(
  completions: CompletionDay[],
  months: number,
): {
  weeks: (CompletionDay | null)[][];
  monthHeaders: { label: string; weekIndex: number }[];
} {
  const completionSet = new Set(completions.map((c) => c.date));
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1);

  // Align to Sunday
  const startDow = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDow);

  const weeks: (CompletionDay | null)[][] = [];
  const monthHeaders: { label: string; weekIndex: number }[] = [];
  let current = new Date(startDate);
  let seenMonths = new Set<string>();

  while (current <= today) {
    const week: (CompletionDay | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split("T")[0];
      const isInRange = current <= today;
      week.push(
        isInRange
          ? { date: dateStr, completed: completionSet.has(dateStr) }
          : null,
      );

      // Track month header
      const monthKey = `${current.getFullYear()}-${current.getMonth()}`;
      if (!seenMonths.has(monthKey) && current.getDate() <= 7) {
        seenMonths.add(monthKey);
        monthHeaders.push({
          label: MONTHS[current.getMonth()],
          weekIndex: weeks.length,
        });
      }

      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return { weeks, monthHeaders };
}

export function CalendarHeatmap({
  completions,
  className,
}: CalendarHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const MONTHS_BACK = 6;

  const { weeks, monthHeaders } = useMemo(
    () => buildWeeks(completions, MONTHS_BACK),
    [completions],
  );

  const totalWidth = weeks.length * CELL_STRIDE;
  const DOW_LABEL_WIDTH = 28;
  const MONTH_LABEL_HEIGHT = 18;

  function handleCellClick(
    e: React.MouseEvent<SVGRectElement>,
    day: CompletionDay | null,
    weekIndex: number,
  ) {
    if (!day) return;
    const rect = (e.target as SVGRectElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    setTooltip({
      x: rect.left - containerRect.left + CELL_SIZE / 2,
      y: rect.top - containerRect.top - 8,
      date: day.date,
      completed: day.completed,
      weekIndex,
    });
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="overflow-x-auto pb-2">
        <svg
          width={DOW_LABEL_WIDTH + totalWidth}
          height={MONTH_LABEL_HEIGHT + 7 * CELL_STRIDE}
          aria-label="Completion calendar heatmap"
          role="img"
        >
          {/* Month labels */}
          {monthHeaders.map(({ label, weekIndex }) => (
            <text
              key={`month-${label}-${weekIndex}`}
              x={DOW_LABEL_WIDTH + weekIndex * CELL_STRIDE}
              y={12}
              fontSize="10"
              fill="oklch(0.64 0.04 279)"
              fontFamily="General Sans, sans-serif"
            >
              {label}
            </text>
          ))}

          {/* Day-of-week labels */}
          {[1, 3, 5].map((dow) => (
            <text
              key={`dow-${dow}`}
              x={0}
              y={MONTH_LABEL_HEIGHT + dow * CELL_STRIDE + CELL_SIZE - 1}
              fontSize="9"
              fill="oklch(0.64 0.04 279)"
              fontFamily="General Sans, sans-serif"
            >
              {DAYS[dow].slice(0, 2)}
            </text>
          ))}

          {/* Calendar cells */}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              if (!day) return null;
              const x = DOW_LABEL_WIDTH + wi * CELL_STRIDE;
              const y = MONTH_LABEL_HEIGHT + di * CELL_STRIDE;
              const cellKey = `cell-${day.date}`;
              return (
                <rect
                  key={cellKey}
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={2}
                  ry={2}
                  fill={
                    day.completed
                      ? "oklch(0.72 0.19 70)"
                      : "oklch(0.18 0.05 309)"
                  }
                  stroke={
                    day.completed
                      ? "oklch(0.82 0.19 84 / 0.4)"
                      : "oklch(0.25 0.06 309 / 0.5)"
                  }
                  strokeWidth={0.5}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => handleCellClick(e, day, wi)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleCellClick(
                        e as unknown as React.MouseEvent<SVGRectElement>,
                        day,
                        wi,
                      );
                    }
                  }}
                  tabIndex={0}
                  aria-label={`${day.date}: ${day.completed ? "completed" : "not completed"}`}
                />
              );
            }),
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-card border border-border/60 rounded-lg px-3 py-2 shadow-lg text-xs min-w-max">
            <p className="font-semibold text-foreground">
              {new Date(tooltip.date).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </p>
            <p
              className={cn(
                "mt-0.5",
                tooltip.completed ? "text-primary" : "text-muted-foreground",
              )}
            >
              {tooltip.completed ? "✓ Completed" : "○ Not completed"}
            </p>
          </div>
          <div className="w-2 h-2 bg-card border-r border-b border-border/60 rotate-45 mx-auto -mt-1" />
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        {(
          [
            "oklch(0.18 0.05 309)",
            "oklch(0.45 0.12 70)",
            "oklch(0.60 0.17 70)",
            "oklch(0.72 0.19 70)",
            "oklch(0.82 0.21 84)",
          ] as const
        ).map((color) => (
          <span
            key={color}
            className="w-3 h-3 rounded-sm inline-block"
            style={{ background: color }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
