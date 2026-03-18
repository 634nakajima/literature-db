import { useMemo, useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import usePaperStore from '../../store/usePaperStore';
import { useAllKeywords } from '../../hooks/usePaperData';
import { buildCooccurrenceMatrix, buildBubbleData, findGaps } from '../../lib/graphUtils';

export default function ResearchGapView() {
  const papers = usePaperStore(s => s.papers);
  const setFilterKeyword = usePaperStore(s => s.setFilterKeyword);
  const setActiveTab = usePaperStore(s => s.setActiveTab);
  const [view, setView] = useState('heatmap');
  const [topN, setTopN] = useState(15);
  const [hoverCell, setHoverCell] = useState(null);
  const allKeywords = useAllKeywords();

  if (allKeywords.length < 2) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        キーワードが2つ以上ある文献を追加するとリサーチギャップが表示されます
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setView('heatmap')}
            className={`text-xs px-3 py-1.5 rounded-md cursor-pointer transition-all border-none ${
              view === 'heatmap' ? 'bg-white text-slate-800 font-medium shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            共起ヒートマップ
          </button>
          <button
            onClick={() => setView('bubble')}
            className={`text-xs px-3 py-1.5 rounded-md cursor-pointer transition-all border-none ${
              view === 'bubble' ? 'bg-white text-slate-800 font-medium shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            カバレッジバブル
          </button>
        </div>

        {view === 'heatmap' && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-slate-400">上位</span>
            <input
              type="range"
              min={5}
              max={Math.min(allKeywords.length, 25)}
              value={topN}
              onChange={e => setTopN(parseInt(e.target.value))}
              className="w-20 accent-blue-600"
            />
            <span className="text-xs text-slate-500 font-medium">{topN}件</span>
          </div>
        )}
      </div>

      {view === 'heatmap' ? (
        <HeatmapView papers={papers} topN={topN} hoverCell={hoverCell} setHoverCell={setHoverCell} />
      ) : (
        <BubbleView papers={papers} onClickKeyword={(k) => { setFilterKeyword(k); setActiveTab('list'); }} />
      )}

      <GapSuggestions papers={papers} topN={topN} />
    </div>
  );
}

function HeatmapView({ papers, topN, hoverCell, setHoverCell }) {
  const { keywords, matrix } = useMemo(
    () => buildCooccurrenceMatrix(papers, topN),
    [papers, topN]
  );

  const n = keywords.length;
  const cellSize = Math.min(36, Math.max(500 / n, 18));

  // Calculate max label width to set proper margin
  const labelMargin = 130;
  const size = n * cellSize;

  const maxVal = Math.max(...matrix.flat(), 1);
  const colorScale = (v) => {
    if (v === 0) return '#f8fafc';
    const t = v / maxVal;
    return d3.interpolateBlues(0.15 + t * 0.75);
  };

  return (
    <div className="overflow-auto">
      <svg
        width={size + labelMargin + 30}
        height={size + labelMargin + 30}
        className="bg-white border border-slate-200/80 rounded-xl shadow-sm"
      >
        <g transform={`translate(${labelMargin}, ${labelMargin})`}>
          {/* Column labels - rotated */}
          {keywords.map((k, i) => (
            <text
              key={`col-${i}`}
              x={i * cellSize + cellSize / 2}
              y={-8}
              textAnchor="start"
              fontSize={10}
              fill="#475569"
              transform={`rotate(-50, ${i * cellSize + cellSize / 2}, -8)`}
            >
              {k}
            </text>
          ))}

          {/* Row labels - full text, right-aligned */}
          {keywords.map((k, i) => (
            <text
              key={`row-${i}`}
              x={-8}
              y={i * cellSize + cellSize / 2 + 3}
              textAnchor="end"
              fontSize={10}
              fill="#475569"
            >
              {k}
            </text>
          ))}

          {/* Cells */}
          {matrix.map((row, i) =>
            row.map((val, j) => (
              <g key={`${i}-${j}`}>
                <rect
                  x={j * cellSize}
                  y={i * cellSize}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  fill={colorScale(val)}
                  stroke={hoverCell && hoverCell.i === i && hoverCell.j === j ? '#2563eb' : '#e2e8f0'}
                  strokeWidth={hoverCell && hoverCell.i === i && hoverCell.j === j ? 2 : 0.5}
                  rx={3}
                  className="cursor-pointer transition-colors"
                  onMouseEnter={() => setHoverCell({ i, j, val, kw1: keywords[i], kw2: keywords[j] })}
                  onMouseLeave={() => setHoverCell(null)}
                />
                {cellSize >= 24 && val > 0 && (
                  <text
                    x={j * cellSize + cellSize / 2}
                    y={i * cellSize + cellSize / 2 + 3}
                    textAnchor="middle"
                    fontSize={9}
                    fill={val / maxVal > 0.5 ? '#fff' : '#475569'}
                    pointerEvents="none"
                    fontWeight={500}
                  >
                    {val}
                  </text>
                )}
              </g>
            ))
          )}
        </g>
      </svg>

      {/* Hover info */}
      {hoverCell && (
        <div className="mt-3 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-4 py-2.5 inline-block shadow-sm">
          <span className="font-semibold">{hoverCell.kw1}</span>
          {' × '}
          <span className="font-semibold">{hoverCell.kw2}</span>
          {': '}
          <span className={hoverCell.val === 0 ? 'text-red-500 font-semibold' : 'text-blue-600 font-medium'}>
            {hoverCell.val === 0 ? '未探索（ギャップ）' : `${hoverCell.val}件`}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <span>少</span>
        <div className="flex rounded overflow-hidden">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => (
            <div key={i} className="w-6 h-3" style={{ background: t === 0 ? '#f8fafc' : d3.interpolateBlues(0.15 + t * 0.75) }} />
          ))}
        </div>
        <span>多</span>
        <span className="ml-3 text-slate-500">白 = 研究の空白（ギャップ）</span>
      </div>
    </div>
  );
}

function BubbleView({ papers, onClickKeyword }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(600);
  const height = 500;

  const bubbleData = useMemo(() => buildBubbleData(papers), [papers]);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      setWidth(Math.max(entries[0].contentRect.width, 300));
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || bubbleData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const maxCount = Math.max(...bubbleData.map(d => d.count), 1);
    const radiusScale = d3.scaleSqrt().domain([1, maxCount]).range([15, 50]);

    const colorScale = (count) => {
      const t = count / maxCount;
      if (t > 0.5) return '#16a34a';
      if (t > 0.2) return '#ca8a04';
      return '#ea580c';
    };

    const nodes = bubbleData.map(d => ({ ...d, r: radiusScale(d.count) }));

    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(5))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.r + 3))
      .on('tick', ticked);

    const g = svg.append('g');

    const nodeGroups = g.selectAll('g')
      .data(nodes).join('g')
      .attr('cursor', 'pointer')
      .on('click', (_, d) => onClickKeyword(d.keyword));

    nodeGroups.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => colorScale(d.count))
      .attr('opacity', 0.75)
      .attr('stroke', d => colorScale(d.count))
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.25);

    nodeGroups.append('text')
      .text(d => d.keyword.length > 12 ? d.keyword.slice(0, 12) + '…' : d.keyword)
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('font-size', d => Math.min(d.r * 0.35, 11))
      .attr('fill', '#fff')
      .attr('font-weight', 600)
      .attr('pointer-events', 'none');

    nodeGroups.append('text')
      .text(d => `${d.count}件`)
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('font-size', d => Math.min(d.r * 0.3, 10))
      .attr('fill', '#fff')
      .attr('opacity', 0.8)
      .attr('pointer-events', 'none');

    function ticked() {
      nodeGroups.attr('transform', d => `translate(${d.x}, ${d.y})`);
    }

    return () => simulation.stop();
  }, [bubbleData, width]);

  return (
    <div ref={containerRef}>
      <p className="text-xs text-slate-400 mb-2">バブルをクリックでそのキーワードの文献一覧へ</p>
      <svg ref={svgRef} width={width} height={height} className="bg-white border border-slate-200/80 rounded-xl shadow-sm" />
      <div className="mt-3 flex items-center gap-5 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#ea580c' }} />
          少ない（ギャップ候補）
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#ca8a04' }} />
          中程度
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#16a34a' }} />
          充実
        </span>
      </div>
    </div>
  );
}

function GapSuggestions({ papers, topN }) {
  const gaps = useMemo(() => findGaps(papers, topN), [papers, topN]);
  if (gaps.length === 0) return null;

  return (
    <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-5">
      <h4 className="text-sm font-bold text-amber-900 mb-3">
        研究ギャップの候補（共起ゼロのキーワードペア）
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {gaps.slice(0, 20).map((g, i) => (
          <span key={i} className="text-[11px] bg-white/80 border border-amber-200/60 rounded-lg px-2.5 py-1 text-amber-800">
            {g.a} × {g.b}
          </span>
        ))}
        {gaps.length > 20 && (
          <span className="text-[11px] text-amber-600 self-center ml-1">他 {gaps.length - 20}件</span>
        )}
      </div>
    </div>
  );
}
