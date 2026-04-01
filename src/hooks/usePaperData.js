import { useMemo } from 'react';
import usePaperStore from '../store/usePaperStore';

export function useFilteredPapers() {
  const papers = usePaperStore(s => s.papers);
  const filterTag = usePaperStore(s => s.filterTag);
  const filterKeyword = usePaperStore(s => s.filterKeyword);
  const sortBy = usePaperStore(s => s.sortBy);

  return useMemo(() => {
    const filtered = papers
      .filter(p => !filterTag || (p.tags || []).includes(filterTag))
      .filter(p => !filterKeyword || (p.keywords || []).includes(filterKeyword));

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'year_desc':
          return (b.year || 0) - (a.year || 0);
        case 'year_asc':
          return (a.year || 0) - (b.year || 0);
        case 'added_desc':
        default:
          return (b.added_at || '').localeCompare(a.added_at || '');
      }
    });
  }, [papers, filterTag, filterKeyword, sortBy]);
}

export function useAllTags() {
  const papers = usePaperStore(s => s.papers);

  return useMemo(() => {
    return [...new Set(papers.flatMap(p => p.tags || []))].sort();
  }, [papers]);
}

export function useAllKeywords() {
  const papers = usePaperStore(s => s.papers);

  return useMemo(() => {
    const counts = {};
    papers.forEach(p =>
      (p.keywords || []).forEach(k => {
        counts[k] = (counts[k] || 0) + 1;
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([k, c]) => ({ keyword: k, count: c }));
  }, [papers]);
}
