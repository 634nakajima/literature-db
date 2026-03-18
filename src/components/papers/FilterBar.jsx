import usePaperStore from '../../store/usePaperStore';
import { useAllTags, useAllKeywords } from '../../hooks/usePaperData';

export default function FilterBar() {
  const papers = usePaperStore(s => s.papers);
  const filterTag = usePaperStore(s => s.filterTag);
  const filterKeyword = usePaperStore(s => s.filterKeyword);
  const setFilterTag = usePaperStore(s => s.setFilterTag);
  const setFilterKeyword = usePaperStore(s => s.setFilterKeyword);
  const clearFilters = usePaperStore(s => s.clearFilters);
  const allTags = useAllTags();
  const allKeywords = useAllKeywords();

  const topKeywords = allKeywords.filter(k => k.count >= 2).slice(0, 10);

  if (allTags.length === 0 && topKeywords.length === 0) return null;

  return (
    <div className="mb-4">
      {allTags.length > 0 && (
        <div className="mb-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Tags
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(t => {
              const count = papers.filter(p => (p.tags || []).includes(t)).length;
              const active = filterTag === t;
              return (
                <button
                  key={t}
                  onClick={() => setFilterTag(t)}
                  className={`text-xs px-3.5 py-1 rounded-full cursor-pointer transition-all border-none ${
                    active
                      ? 'bg-amber-800 text-white font-semibold'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  {t} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {topKeywords.length > 0 && (
        <div className="mb-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Keywords（上位）
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topKeywords.map(({ keyword: k, count }) => {
              const active = filterKeyword === k;
              return (
                <button
                  key={k}
                  onClick={() => setFilterKeyword(k)}
                  className={`text-xs px-3.5 py-1 rounded-full cursor-pointer transition-all border-none ${
                    active
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {k} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(filterTag || filterKeyword) && (
        <button
          onClick={clearFilters}
          className="text-xs text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0"
        >
          ✕ フィルターを解除
        </button>
      )}
    </div>
  );
}
