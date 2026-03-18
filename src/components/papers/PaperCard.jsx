export default function PaperCard({ paper, onClick }) {
  return (
    <div
      className="card-hover bg-white border border-slate-200/80 rounded-xl p-5 mb-3 cursor-pointer"
      onClick={() => onClick(paper)}
    >
      <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5 leading-snug">
        {paper.title}
      </h3>
      <p className="text-xs text-slate-400 mb-2">
        {paper.authors && <span>{paper.authors}</span>}
        {paper.year && <span> · {paper.year}</span>}
        {paper.venue && <span> · <span className="text-slate-500">{paper.venue}</span></span>}
      </p>
      {paper.abstract && (
        <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 mb-2">
          {paper.abstract}
        </p>
      )}
      <div className="flex flex-wrap gap-1">
        {(paper.keywords || []).map((k, i) => (
          <span
            key={i}
            className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-500 font-medium"
          >
            {k}
          </span>
        ))}
        {(paper.tags || []).map((t, i) => (
          <span
            key={`t${i}`}
            className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
