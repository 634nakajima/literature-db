import { useMemo, useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import usePaperStore from '../../store/usePaperStore';
import { useAllTags } from '../../hooks/usePaperData';
import { getTagColor, groupByTag } from '../../lib/graphUtils';

export default function TimelineView() {
  const papers = usePaperStore(s => s.papers);
  const setSelectedPaper = usePaperStore(s => s.setSelectedPaper);
  const setActiveTab = usePaperStore(s => s.setActiveTab);
  const allTags = useAllTags();

  const [swimlane, setSwimlane] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDimensions(d => ({ ...d, width: Math.max(width, 300) }));
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const papersWithYear = useMemo(
    () => papers.filter(p => p.year != null),
    [papers]
  );

  const yearRange = useMemo(() => {
    if (papersWithYear.length === 0) return [2020, 2026];
    const years = papersWithYear.map(p => p.year);
    return [Math.min(...years) - 1, Math.max(...years) + 1];
  }, [papersWithYear]);

  const margin = { top: 30, right: 30, bottom: 80, left: 40 };
  const width = dimensions.width;
  const innerWidth = width - margin.left - margin.right;

  // Year scale
  const xScale = useMemo(
    () => d3.scaleLinear().domain(yearRange).range([0, innerWidth]),
    [yearRange, innerWidth]
  );

  // Count papers per year for bar chart
  const yearCounts = useMemo(() => {
    const counts = {};
    papersWithYear.forEach(p => {
      counts[p.year] = (counts[p.year] || 0) + 1;
    });
    return counts;
  }, [papersWithYear]);

  // Layout papers
  const positionedPapers = useMemo(() => {
    if (swimlane) {
      const tagGroups = groupByTag(papersWithYear);
      const tagList = Object.keys(tagGroups).sort();
      const laneHeight = 80;
      const totalHeight = tagList.length * laneHeight + 60;
      setDimensions(d => ({ ...d, height: Math.max(totalHeight + margin.top + margin.bottom + 80, 400) }));

      const positioned = [];
      tagList.forEach((tag, laneIdx) => {
        const lanePapers = tagGroups[tag].sort((a, b) => (a.year || 0) - (b.year || 0));
        lanePapers.forEach((p, i) => {
          positioned.push({
            paper: p,
            x: xScale(p.year),
            y: laneIdx * laneHeight + 30,
            color: getTagColor(tag, allTags),
            lane: tag,
            laneIdx,
          });
        });
      });
      return { items: positioned, lanes: tagList, laneHeight };
    } else {
      // Stack by year
      const stacks = {};
      papersWithYear
        .slice()
        .sort((a, b) => (a.year || 0) - (b.year || 0))
        .forEach(p => {
          const y = p.year;
          stacks[y] = (stacks[y] || 0);
          stacks[y]++;
        });

      const maxStack = Math.max(...Object.values(stacks), 1);
      const availableHeight = Math.max(maxStack * 25 + 60, 300);
      setDimensions(d => ({ ...d, height: availableHeight + margin.top + margin.bottom + 80 }));

      const currentStacks = {};
      const positioned = [];
      papersWithYear
        .slice()
        .sort((a, b) => (a.year || 0) - (b.year || 0))
        .forEach(p => {
          currentStacks[p.year] = (currentStacks[p.year] || 0);
          const primaryTag = (p.tags || [])[0] || '';
          positioned.push({
            paper: p,
            x: xScale(p.year),
            y: currentStacks[p.year] * 25,
            color: primaryTag ? getTagColor(primaryTag, allTags) : '#94a3b8',
          });
          currentStacks[p.year]++;
        });
      return { items: positioned, lanes: null, laneHeight: 0 };
    }
  }, [papersWithYear, swimlane, xScale, allTags]);

  const handleClick = (paper) => {
    setSelectedPaper(paper);
    setActiveTab('list');
  };

  if (papersWithYear.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        年が設定された文献を追加するとタイムラインが表示されます
      </div>
    );
  }

  const ticks = xScale.ticks(Math.min(innerWidth / 80, yearRange[1] - yearRange[0]));
  const barMax = Math.max(...Object.values(yearCounts), 1);
  const barHeight = 50;

  const mainHeight = dimensions.height - margin.top - margin.bottom - barHeight - 20;

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setSwimlane(false)}
          className={`text-xs px-3 py-1 rounded-md cursor-pointer transition-all border-none ${
            !swimlane ? 'bg-blue-600 text-white font-medium' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          スタック表示
        </button>
        <button
          onClick={() => setSwimlane(true)}
          className={`text-xs px-3 py-1 rounded-md cursor-pointer transition-all border-none ${
            swimlane ? 'bg-blue-600 text-white font-medium' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          タグ別スイムレーン
        </button>
      </div>

      <div ref={containerRef} className="w-full overflow-x-auto">
        <svg width={width} height={dimensions.height} className="bg-white border border-slate-200 rounded-lg">
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Year gridlines */}
            {ticks.map(year => (
              <g key={year}>
                <line
                  x1={xScale(year)} y1={0}
                  x2={xScale(year)} y2={mainHeight}
                  stroke="#f1f5f9" strokeWidth={1}
                />
                <text
                  x={xScale(year)} y={mainHeight + 16}
                  textAnchor="middle"
                  fontSize={11} fill="#94a3b8"
                >
                  {year}
                </text>
              </g>
            ))}

            {/* Swim lane labels and backgrounds */}
            {swimlane && positionedPapers.lanes?.map((lane, i) => (
              <g key={lane}>
                {i > 0 && (
                  <line
                    x1={0} y1={i * positionedPapers.laneHeight - 5}
                    x2={innerWidth} y2={i * positionedPapers.laneHeight - 5}
                    stroke="#e2e8f0" strokeDasharray="4,4"
                  />
                )}
                <text
                  x={-8} y={i * positionedPapers.laneHeight + 20}
                  textAnchor="end" fontSize={10} fill="#64748b" fontWeight={600}
                >
                  {lane.length > 8 ? lane.slice(0, 8) + '…' : lane}
                </text>
              </g>
            ))}

            {/* Paper dots */}
            {positionedPapers.items.map(({ paper, x, y, color }) => (
              <g
                key={paper.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer"
                onClick={() => handleClick(paper)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                    paper,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <circle r={8} fill={color} opacity={0.85} />
                <circle r={8} fill="transparent" stroke={color} strokeWidth={2} opacity={0.3} />
              </g>
            ))}

            {/* Bar chart at bottom */}
            <g transform={`translate(0, ${mainHeight + 30})`}>
              <text x={0} y={-4} fontSize={10} fill="#94a3b8" fontWeight={600}>
                論文数/年
              </text>
              {Object.entries(yearCounts).map(([year, count]) => {
                const barW = Math.max(innerWidth / (yearRange[1] - yearRange[0]) * 0.6, 8);
                const barH = (count / barMax) * barHeight;
                return (
                  <g key={year}>
                    <rect
                      x={xScale(parseInt(year)) - barW / 2}
                      y={barHeight - barH}
                      width={barW}
                      height={barH}
                      fill="#2563eb"
                      opacity={0.15}
                      rx={2}
                    />
                    <text
                      x={xScale(parseInt(year))}
                      y={barHeight - barH - 3}
                      textAnchor="middle"
                      fontSize={9} fill="#64748b"
                    >
                      {count}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-slate-900 text-white text-xs px-3 py-2 rounded-md shadow-lg pointer-events-none max-w-xs"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold mb-0.5">{tooltip.paper.title}</div>
          <div className="text-slate-300">
            {tooltip.paper.authors} ({tooltip.paper.year})
          </div>
        </div>
      )}
    </div>
  );
}
