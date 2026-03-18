import { useState } from 'react';

export default function PaperCard({ paper, onClick }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg p-4 mb-2.5 cursor-pointer transition-shadow ${
        hover ? 'shadow-md' : ''
      }`}
      onClick={() => onClick(paper)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <h3 className="text-[15px] font-semibold text-slate-900 mb-1 leading-snug">
        {paper.title}
      </h3>
      <p className="text-xs text-slate-500 mb-1.5">
        {paper.authors && <span>{paper.authors}</span>}
        {paper.year && <span> · {paper.year}</span>}
        {paper.venue && <span> · {paper.venue}</span>}
      </p>
      {paper.abstract && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {paper.abstract}
        </p>
      )}
      <div className="mt-1.5">
        {(paper.keywords || []).map((k, i) => (
          <span
            key={i}
            className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 mr-1 mt-1"
          >
            {k}
          </span>
        ))}
        {(paper.tags || []).map((t, i) => (
          <span
            key={`t${i}`}
            className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 mr-1 mt-1"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
