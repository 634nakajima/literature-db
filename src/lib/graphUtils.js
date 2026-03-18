// Tag color palette
const TAG_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c',
  '#0891b2', '#c026d3', '#ca8a04', '#4f46e5', '#059669',
];

export function getTagColor(tag, allTags) {
  const idx = allTags.indexOf(tag);
  return TAG_COLORS[idx % TAG_COLORS.length];
}

/**
 * Build Cytoscape elements from papers array.
 * Nodes = papers, Edges = shared keywords/tags between papers.
 */
export function buildNetworkElements(papers, filterTag = null) {
  const filtered = filterTag
    ? papers.filter(p => (p.tags || []).includes(filterTag))
    : papers;

  const allTags = [...new Set(papers.flatMap(p => p.tags || []))].sort();

  // Build nodes
  const nodes = filtered.map(p => {
    const primaryTag = (p.tags || [])[0] || '';
    return {
      data: {
        id: p.id,
        label: p.title.length > 30 ? p.title.slice(0, 30) + '…' : p.title,
        fullTitle: p.title,
        year: p.year,
        authors: p.authors,
        color: primaryTag ? getTagColor(primaryTag, allTags) : '#94a3b8',
        size: 30, // will be updated based on degree
      },
    };
  });

  // Build edges based on shared keywords and tags
  const edges = [];
  for (let i = 0; i < filtered.length; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      const a = filtered[i];
      const b = filtered[j];
      const sharedKeywords = (a.keywords || []).filter(k => (b.keywords || []).includes(k));
      const sharedTags = (a.tags || []).filter(t => (b.tags || []).includes(t));
      const weight = sharedKeywords.length + sharedTags.length;
      if (weight > 0) {
        edges.push({
          data: {
            id: `${a.id}-${b.id}`,
            source: a.id,
            target: b.id,
            weight: Math.min(weight, 5),
            sharedTerms: [...sharedKeywords, ...sharedTags].join(', '),
          },
        });
      }
    }
  }

  // Update node sizes based on degree (connection count)
  const degreeCounts = {};
  edges.forEach(e => {
    degreeCounts[e.data.source] = (degreeCounts[e.data.source] || 0) + 1;
    degreeCounts[e.data.target] = (degreeCounts[e.data.target] || 0) + 1;
  });
  nodes.forEach(n => {
    const degree = degreeCounts[n.data.id] || 0;
    n.data.size = 20 + degree * 5;
  });

  return { nodes, edges };
}

/**
 * Build co-occurrence matrix for keywords.
 * Returns { keywords: string[], matrix: number[][] }
 */
export function buildCooccurrenceMatrix(papers, topN = 15) {
  // Count keyword frequencies
  const freq = {};
  papers.forEach(p => {
    (p.keywords || []).forEach(k => {
      freq[k] = (freq[k] || 0) + 1;
    });
  });

  // Get top N keywords by frequency
  const keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([k]) => k);

  // Build matrix
  const n = keywords.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  papers.forEach(p => {
    const pk = p.keywords || [];
    for (let i = 0; i < n; i++) {
      if (!pk.includes(keywords[i])) continue;
      for (let j = i; j < n; j++) {
        if (!pk.includes(keywords[j])) continue;
        matrix[i][j]++;
        if (i !== j) matrix[j][i]++;
      }
    }
  });

  return { keywords, matrix, freq };
}

/**
 * Build bubble data for keyword coverage visualization.
 */
export function buildBubbleData(papers) {
  const freq = {};
  papers.forEach(p => {
    (p.keywords || []).forEach(k => {
      freq[k] = (freq[k] || 0) + 1;
    });
  });

  return Object.entries(freq)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Find keyword pairs with zero co-occurrence (research gaps).
 */
export function findGaps(papers, topN = 15) {
  const { keywords, matrix } = buildCooccurrenceMatrix(papers, topN);
  const gaps = [];

  for (let i = 0; i < keywords.length; i++) {
    for (let j = i + 1; j < keywords.length; j++) {
      if (matrix[i][j] === 0) {
        gaps.push({ a: keywords[i], b: keywords[j] });
      }
    }
  }

  return gaps;
}

/**
 * Group papers by year for timeline view.
 */
export function groupByYear(papers) {
  const groups = {};
  papers.forEach(p => {
    const year = p.year || 'Unknown';
    if (!groups[year]) groups[year] = [];
    groups[year].push(p);
  });
  return groups;
}

/**
 * Group papers by tag for swim-lane view.
 */
export function groupByTag(papers) {
  const groups = {};
  papers.forEach(p => {
    const tags = (p.tags || []).length > 0 ? p.tags : ['未分類'];
    tags.forEach(tag => {
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(p);
    });
  });
  return groups;
}
