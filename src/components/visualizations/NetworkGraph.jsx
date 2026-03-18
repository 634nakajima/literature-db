import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import usePaperStore from '../../store/usePaperStore';
import { useAllTags } from '../../hooks/usePaperData';
import { buildNetworkElements } from '../../lib/graphUtils';

const cyStyle = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      width: 'data(size)',
      height: 'data(size)',
      'background-color': 'data(color)',
      'font-size': 9,
      'text-wrap': 'ellipsis',
      'text-max-width': 80,
      'text-valign': 'bottom',
      'text-margin-y': 4,
      color: '#475569',
      'min-zoomed-font-size': 8,
    },
  },
  {
    selector: 'edge',
    style: {
      width: 'data(weight)',
      'line-color': '#cbd5e1',
      'curve-style': 'bezier',
      opacity: 0.4,
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 3,
      'border-color': '#2563eb',
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
    circle: {
      name: 'circle',
      animate: true,
      animationDuration: 500,
    },
    grid: {
      name: 'grid',
      animate: true,
      animationDuration: 500,
    },
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

  const handleFit = () => {
    cyRef.current?.fit(undefined, 30);
  };

  const handleRelayout = () => {
    cyRef.current?.layout(layoutOptions[layout]).run();
  };

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
        <div className="flex gap-1">
          {[
            { key: 'cose', label: 'Force' },
            { key: 'circle', label: 'Circle' },
            { key: 'grid', label: 'Grid' },
          ].map(l => (
            <button
              key={l.key}
              onClick={() => setLayout(l.key)}
              className={`text-xs px-3 py-1 rounded-md cursor-pointer transition-all border-none ${
                layout === l.key
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleFit}
          className="text-xs px-3 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-all border-none"
        >
          全体表示
        </button>
        <button
          onClick={handleRelayout}
          className="text-xs px-3 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-all border-none"
        >
          再配置
        </button>

        {allTags.length > 0 && (
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => setFilterTag(null)}
              className={`text-xs px-2 py-1 rounded-full cursor-pointer transition-all border-none ${
                !filterTag ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {allTags.map(t => (
              <button
                key={t}
                onClick={() => setFilterTag(filterTag === t ? null : t)}
                className={`text-xs px-2 py-1 rounded-full cursor-pointer transition-all border-none ${
                  filterTag === t
                    ? 'bg-amber-800 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-slate-400 mb-2">
        ノードをタップで詳細表示 / ドラッグ・ピンチで移動・ズーム / エッジは共通キーワード・タグ
      </p>

      {/* Graph container */}
      <div
        ref={containerRef}
        className="w-full border border-slate-200 rounded-lg bg-white"
        style={{ height: 'calc(100vh - 280px)', minHeight: 400 }}
      />
    </div>
  );
}
