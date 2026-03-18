import { useMemo } from 'react';
import usePaperStore from '../store/usePaperStore';

export function useFilteredPapers() {
  const papers = usePaperStore(s => s.papers);
  const filterTag = usePaperStore(s => s.filterTag);
  const filterKeyword = usePaperStore(s => s.filterKeyword);

  return useMemo(() => {
    return papers
      .filter(p => !filterTag || (p.tags || []).includes(filterTag))
      .filter(p => !filterKeyword || (p.keywords || []).includes(filterKeyword));
  }, [papers, filterTag, filterKeyword]);
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
