export default function PaperDetail({ paper, onBack, onEdit, onDelete }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="text-blue-600 text-sm mb-4 hover:underline cursor-pointer bg-transparent border-none p-0"
      >
        ← 一覧に戻る
      </button>
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2 leading-snug">{paper.title}</h2>
        <p className="text-sm text-slate-500 mb-4">
          {paper.authors}
          {paper.year && ` (${paper.year})`}
          {paper.venue && ` — ${paper.venue}`}
        </p>

        {paper.abstract && (
          <Section label="Abstract">
            <p className="text-sm text-slate-900 leading-relaxed">{paper.abstract}</p>
          </Section>
        )}

        {paper.doi && (
          <Section label="DOI">
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {paper.doi}
            </a>
          </Section>
        )}

        {paper.url && (
          <Section label="URL">
            <a
              href={paper.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {paper.url}
            </a>
          </Section>
        )}

        {paper.notes && (
          <Section label="Notes">
            <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">{paper.notes}</p>
          </Section>
        )}

        {paper.bibtex && (
          <Section label="BibTeX">
            <pre className="text-xs bg-slate-100 p-3 rounded-md overflow-auto whitespace-pre-wrap font-mono">
              {paper.bibtex}
            </pre>
          </Section>
        )}

        <div className="mt-2">
          {(paper.keywords || []).map((k, i) => (
            <span key={i} className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 mr-1 mt-1">
              {k}
            </span>
          ))}
          {(paper.tags || []).map((t, i) => (
            <span key={`t${i}`} className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 mr-1 mt-1">
              {t}
            </span>
          ))}
        </div>

        <div className="flex gap-2 mt-5 flex-wrap">
          <button
            onClick={() => onEdit(paper)}
            className="px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer border-none"
          >
            編集
          </button>
          <button
            onClick={() => {
              if (confirm('この文献を削除しますか？')) onDelete(paper.id);
            }}
            className="px-5 py-2 rounded-md bg-white text-red-600 text-sm font-medium border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="mb-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}
