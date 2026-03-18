export function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const EMPTY = {
  title: "", authors: "", year: "", abstract: "", venue: "",
  doi: "", url: "", keywords: "", tags: "", notes: "", bibtex: "",
};

export { EMPTY };

export function toRecord(f) {
  return {
    id: f.id || uuid(),
    title: f.title || "",
    authors: f.authors || "",
    year: f.year ? parseInt(f.year, 10) : null,
    abstract: f.abstract || "",
    venue: f.venue || "",
    doi: f.doi || "",
    url: f.url || "",
    keywords: typeof f.keywords === "string"
      ? f.keywords.split(",").map(s => s.trim()).filter(Boolean)
      : (f.keywords || []),
    tags: typeof f.tags === "string"
      ? f.tags.split(",").map(s => s.trim()).filter(Boolean)
      : (f.tags || []),
    notes: f.notes || "",
    bibtex: f.bibtex || "",
    added_at: f.added_at || new Date().toISOString(),
  };
}

export function toForm(p) {
  return {
    id: p.id,
    title: p.title || "",
    authors: p.authors || "",
    year: p.year?.toString() || "",
    abstract: p.abstract || "",
    venue: p.venue || "",
    doi: p.doi || "",
    url: p.url || "",
    keywords: (p.keywords || []).join(", "),
    tags: (p.tags || []).join(", "),
    notes: p.notes || "",
    bibtex: p.bibtex || "",
    added_at: p.added_at,
  };
}

export function matchesQuery(paper, q) {
  const lower = q.toLowerCase();
  return [
    paper.title, paper.authors, paper.abstract,
    paper.notes, paper.venue,
    ...(paper.keywords || []),
    ...(paper.tags || []),
  ].some(f => f && f.toLowerCase().includes(lower));
}

export function isDuplicate(existing, p) {
  return existing.some(e =>
    (e.title && p.title && e.title.toLowerCase() === p.title.toLowerCase()) ||
    (e.doi && p.doi && e.doi === p.doi)
  );
}
