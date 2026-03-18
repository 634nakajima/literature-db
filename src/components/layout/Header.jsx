import usePaperStore from '../../store/usePaperStore';

export default function Header() {
  const exportPapers = usePaperStore(s => s.exportPapers);
  const paperCount = usePaperStore(s => s.papers.length);

  return (
    <header className="header-accent text-white px-6 py-5 flex items-center justify-between border-b border-slate-700/50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wide">Literature DB</h1>
          <p className="text-xs text-slate-400 tracking-wider">
            {paperCount} papers registered
          </p>
        </div>
      </div>
      <button
        onClick={exportPapers}
        className="text-xs text-slate-300 border border-slate-600/60 rounded-lg px-4 py-2 hover:bg-white/5 hover:border-slate-500 transition-all cursor-pointer"
      >
        Export JSON
      </button>
    </header>
  );
}
