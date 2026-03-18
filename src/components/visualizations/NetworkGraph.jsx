import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import usePaperStore from '../../store/usePaperStore';
import { useAllTags } from '../../hooks/usePaperData';
import { buildNetworkElements, getTagColor, LAB_THEMES } from '../../lib/graphUtils';

const cyStyle = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      width: 'data(size)',
      height: 'data(size)',
      'background-color': 'data(color)',
      'font-size': 6,
      'text-wrap': 'wrap',
      'text-max-width': 100,
      'text-valign': 'bottom',
      'text-margin-y': 4,
      color: '#475569',
      'min-zoomed-font-size': 6,
      'border-width': 2,
      'border-color': 'data(color)',
      'border-opacity': 0.2,
      'background-opacity': 0.85,
    },
  },
  {
    selector: 'edge',
    style: {
      width: 'data(weight)',
      'line-color': '#e2e8f0',
      'curve-style': 'bezier',
      opacity: 0.5,
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 3,
      'border-color': '#2563eb',
      'border-opacity': 1,
    },
  },
  {
    selector: 'node:active',
    style: {
      'overlay-opacity': 0,
    },
  },
];

export default function NetworkGraph() {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const papers = usePaperStore(s => s.papers);
  const setSelectedPaper = usePaperStore(s => s.setSelectedPaper);
  const setActiveTab = usePaperStore(s => s.setActiveTab);
  const allTags = useAllTags();

  const [filterTag, setFilterTag] = useState(null);
  const [layout, setLayout] = useState('cose');

  const layoutOptions = {
    cose: {
      name: 'cose',
      animate: true,
      animationDuration: 500,
      nodeRepulsion: 8000,
      idealEdgeLength: 100,
      gravity: 0.25,
    },
    circle: { name: 'circle', animate: true, animationDuration: 500 },
    grid: { name: 'grid', animate: true, animationDuration: 500 },
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const { nodes, edges } = buildNetworkElements(papers, filterTag);

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: cyStyle,
      layout: layoutOptions[layout],
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    cy.on('tap', 'node', (evt) => {
      const nodeId = evt.target.data('id');
      const paper = papers.find(p => p.id === nodeId);
      if (paper) {
        setSelectedPaper(paper);
        setActiveTab('list');
      }
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [papers, filterTag, layout]);

  const handleFit = () => cyRef.current?.fit(undefined, 30);
  const handleRelayout = () => cyRef.current?.layout(layoutOptions[layout]).run();

  if (papers.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        文献を追加するとネットワークグラフが表示されます
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {[
            { key: 'cose', label: 'Force' },
            { key: 'circle', label: 'Circle' },
            { key: 'grid', label: 'Grid' },
          ].map(l => (
            <button
              key={l.key}
              onClick={() => setLayout(l.key)}
              className={`text-xs px-3 py-1.5 rounded-md cursor-pointer transition-all border-none ${
                layout === l.key
                  ? 'bg-white text-slate-800 font-medium shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          <button onClick={handleFit} className="text-xs px-3 py-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer transition-all border-none">
            全体表示
          </button>
          <button onClick={handleRelayout} className="text-xs px-3 py-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer transition-all border-none">
            再配置
          </button>
        </div>

        {allTags.length > 0 && (
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setFilterTag(null)}
              className={`text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all border-none ${
                !filterTag ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {allTags.map(t => (
              <button
                key={t}
                onClick={() => setFilterTag(filterTag === t ? null : t)}
                className={`text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all border-none ${
                  filterTag === t
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Graph container */}
      <div
        ref={containerRef}
        className="w-full border border-slate-200/80 rounded-xl bg-white shadow-sm"
        style={{ height: 'calc(100vh - 300px)', minHeight: 400 }}
      />

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span className="font-medium text-slate-500">色 = タグ:</span>
        {allTags.map(tag => (
          <span key={tag} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ background: getTagColor(tag, allTags), opacity: 0.85 }}
            />
            {tag}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block bg-slate-400" />
          タグなし
        </span>
        <span className="ml-auto">ノードサイズ = 接続数 / エッジ = 共通キーワード・タグ</span>
      </div>
    </div>
  );
}
