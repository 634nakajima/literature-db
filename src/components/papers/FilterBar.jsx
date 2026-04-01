import usePaperStore from '../../store/usePaperStore';
import { useAllTags, useAllKeywords } from '../../hooks/usePaperData';
import { LAB_THEMES, getTagColor } from '../../lib/helpers';

export default function FilterBar() {
  const papers = usePaperStore(s => s.papers);
  const filterTag = usePaperStore(s => s.filterTag);
  const filterKeyword = usePaperStore(s => s.filterKeyword);
  const setFilterTag = usePaperStore(s => s.setFilterTag);
  const setFilterKeyword = usePaperStore(s => s.setFilterKeyword);
  const sortBy = usePaperStore(s => s.sortBy);
  const setSortBy = usePaperStore(s => s.setSortBy);
  const clearFilters = usePaperStore(s => s.clearFilters);
  const allTags = useAllTags();
  const allKeywords = useAllKeywords();

  const topKeywords = allKeywords.filter(k => k.count >= 2).slice(0, 12);

  // Separate lab themes and other tags
  const labThemeTags = LAB_THEMES.filter(t => allTags.includes(t));
  const otherTags = allTags.filter(t => !LAB_THEMES.includes(t));

  if (allTags.length === 0 && topKeywords.length === 0) return null;

  return (
    <div className="mb-5 bg-white/60 rounded-xl p-4 border border-slate-100">
      {/* Sort */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Sort</span>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 cursor-pointer"
        >
          <option value="added_desc">登録日（新しい順）</option>
          <option value="year_desc">出版年（新しい順）</option>
          <option value="year_asc">出版年（古い順）</option>
        </select>
      </div>

      {/* Lab themes */}
      {labThemeTags.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Research Themes
          </div>
          <div className="flex flex-wrap gap-1.5">
            {labThemeTags.map(t => {
              const count = papers.filter(p => (p.tags || []).includes(t)).length;
              const active = filterTag === t;
              const color = getTagColor(t, allTags);
              return (
                <button
                  key={t}
                  onClick={() => setFilterTag(t)}
                  className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all border-none font-medium"
                  style={{
                    background: active ? color : `${color}18`,
                    color: active ? '#fff' : color,
                    boxShadow: active ? `0 2px 8px ${color}40` : 'none',
                  }}
                >
                  {t} <span style={{ opacity: 0.6 }}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Other tags */}
      {otherTags.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Tags</div>
          <div className="flex flex-wrap gap-1.5">
            {otherTags.map(t => {
              const count = papers.filter(p => (p.tags || []).includes(t)).length;
              const active = filterTag === t;
              return (
                <button
                  key={t}
                  onClick={() => setFilterTag(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all border-none ${
                    active
                      ? 'bg-amber-700 text-white font-semibold shadow-sm'
                      : 'bg-amber-50/80 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  {t} <span className={active ? 'text-amber-200' : 'text-amber-400'}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Frequent keywords */}
      {topKeywords.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Keywords (2+)</div>
          <div className="flex flex-wrap gap-1.5">
            {topKeywords.map(({ keyword: k, count }) => {
              const active = filterKeyword === k;
              return (
                <button
                  key={k}
                  onClick={() => setFilterKeyword(k)}
                  className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all border-none ${
                    active
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-blue-50/80 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {k} <span className={active ? 'text-blue-200' : 'text-blue-400'}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(filterTag || filterKeyword) && (
        <button
          onClick={clearFilters}
          className="text-xs text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0 mt-1"
        >
          ✕ フィルターを解除
        </button>
      )}
    </div>
  );
}
