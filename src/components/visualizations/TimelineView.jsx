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
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      setContainerWidth(Math.max(entries[0].contentRect.width, 300));
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

  const leftMargin = swimlane ? 110 : 40;
  const margin = { top: 30, right: 30, bottom: 90, left: leftMargin };
  const innerWidth = containerWidth - margin.left - margin.right;

  const xScale = useMemo(
    () => d3.scaleLinear().domain(yearRange).range([0, innerWidth]),
    [yearRange, innerWidth]
  );

  const yearCounts = useMemo(() => {
    const counts = {};
    papersWithYear.forEach(p => { counts[p.year] = (counts[p.year] || 0) + 1; });
    return counts;
  }, [papersWithYear]);

  const { items: positioned, lanes, laneHeight, totalHeight } = useMemo(() => {
    if (swimlane) {
      const tagGroups = groupByTag(papersWithYear);
      const tagList = Object.keys(tagGroups).sort();
      const lh = 80;
      const totalH = tagList.length * lh + 60;
      const items = [];
      tagList.forEach((tag, laneIdx) => {
        tagGroups[tag].sort((a, b) => (a.year || 0) - (b.year || 0)).forEach(p => {
          items.push({
            paper: p, x: xScale(p.year), y: laneIdx * lh + 30,
            color: getTagColor(tag, allTags), lane: tag, laneIdx,
          });
        });
      });
      return { items, lanes: tagList, laneHeight: lh, totalHeight: totalH };
    } else {
      const stacks = {};
      papersWithYear.slice().sort((a, b) => (a.year || 0) - (b.year || 0)).forEach(p => {
        stacks[p.year] = (stacks[p.year] || 0) + 1;
      });
      const maxStack = Math.max(...Object.values(stacks), 1);
      const totalH = Math.max(maxStack * 28 + 60, 250);
      const currentStacks = {};
      const items = [];
      papersWithYear.slice().sort((a, b) => (a.year || 0) - (b.year || 0)).forEach(p => {
        currentStacks[p.year] = currentStacks[p.year] || 0;
        const primaryTag = (p.tags || [])[0] || '';
        items.push({
          paper: p, x: xScale(p.year), y: currentStacks[p.year] * 28,
          color: primaryTag ? getTagColor(primaryTag, allTags) : '#94a3b8',
        });
        currentStacks[p.year]++;
      });
      return { items, lanes: null, laneHeight: 0, totalHeight: totalH };
    }
  }, [papersWithYear, swimlane, xScale, allTags]);

  const handleClick = (paper) => { setSelectedPaper(paper); setActiveTab('list'); };

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
  const mainHeight = totalHeight;
  const svgHeight = mainHeight + margin.top + margin.bottom + barHeight + 20;

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setSwimlane(false)}
            className={`text-xs px-3 py-1.5 rounded-md cursor-pointer transition-all border-none ${
              !swimlane ? 'bg-white text-slate-800 font-medium shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            スタック表示
          </button>
          <button
            onClick={() => setSwimlane(true)}
            className={`text-xs px-3 py-1.5 rounded-md cursor-pointer transition-all border-none ${
              swimlane ? 'bg-white text-slate-800 font-medium shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            タグ別スイムレーン
          </button>
        </div>
      </div>

      <div ref={containerRef} className="w-full overflow-x-auto">
        <svg width={containerWidth} height={svgHeight} className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Year gridlines */}
            {ticks.map(year => (
              <g key={year}>
                <line x1={xScale(year)} y1={0} x2={xScale(year)} y2={mainHeight} stroke="#f1f5f9" strokeWidth={1} />
                <text x={xScale(year)} y={mainHeight + 16} textAnchor="middle" fontSize={11} fill="#94a3b8">
                  {year}
                </text>
              </g>
            ))}

            {/* Swim lane labels */}
            {swimlane && lanes?.map((lane, i) => (
              <g key={lane}>
                {i > 0 && (
                  <line x1={0} y1={i * laneHeight - 5} x2={innerWidth} y2={i * laneHeight - 5} stroke="#e2e8f0" strokeDasharray="4,4" />
                )}
                <text x={-12} y={i * laneHeight + 25} textAnchor="end" fontSize={11} fill="#475569" fontWeight={600}>
                  {lane}
                </text>
              </g>
            ))}

            {/* Paper dots */}
            {positioned.map(({ paper, x, y, color }) => (
              <g
                key={paper.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer"
                onClick={() => handleClick(paper)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 10, paper });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <circle r={9} fill={color} opacity={0.8} />
                <circle r={9} fill="transparent" stroke={color} strokeWidth={2} opacity={0.25} />
              </g>
            ))}

            {/* Bar chart */}
            <g transform={`translate(0, ${mainHeight + 30})`}>
              <text x={0} y={-4} fontSize={10} fill="#94a3b8" fontWeight={600}>論文数/年</text>
              {Object.entries(yearCounts).map(([year, count]) => {
                const barW = Math.max(innerWidth / (yearRange[1] - yearRange[0]) * 0.6, 8);
                const barH = (count / barMax) * barHeight;
                return (
                  <g key={year}>
                    <rect x={xScale(parseInt(year)) - barW / 2} y={barHeight - barH} width={barW} height={barH} fill="#2563eb" opacity={0.12} rx={3} />
                    <text x={xScale(parseInt(year))} y={barHeight - barH - 4} textAnchor="middle" fontSize={9} fill="#64748b">{count}</text>
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
          className="fixed z-50 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none max-w-xs"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          <div className="font-semibold mb-0.5">{tooltip.paper.title}</div>
          <div className="text-slate-300">{tooltip.paper.authors} ({tooltip.paper.year})</div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span className="font-medium text-slate-500">色 = タグ:</span>
        {allTags.map(tag => (
          <span key={tag} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: getTagColor(tag, allTags), opacity: 0.8 }} />
            {tag}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block bg-slate-400" />
          タグなし
        </span>
      </div>
    </div>
  );
}
