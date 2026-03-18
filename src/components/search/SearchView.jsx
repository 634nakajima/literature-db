import { useState } from 'react';
import usePaperStore from '../../store/usePaperStore';
import { matchesQuery } from '../../lib/helpers';
import PaperCard from '../papers/PaperCard';

export default function SearchView() {
  const papers = usePaperStore(s => s.papers);
  const setSelectedPaper = usePaperStore(s => s.setSelectedPaper);
  const setActiveTab = usePaperStore(s => s.setActiveTab);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = () => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    setResults(papers.filter(p => matchesQuery(p, query)));
  };

  const handleSelect = (paper) => {
    setSelectedPaper(paper);
    setActiveTab('list');
  };

  return (
    <div>
      <div className="flex gap-2 mb-5">
        <input
          className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="タイトル、著者、要旨、キーワード、タグ等で検索..."
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer border-none"
        >
          検索
        </button>
      </div>

      {results !== null && (
        <div>
          <div className="text-sm text-slate-500 mb-3">
            {results.length}件の結果
          </div>
          {results.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              該当する文献が見つかりませんでした
            </div>
          ) : (
            results.map(p => (
              <PaperCard key={p.id} paper={p} onClick={handleSelect} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
