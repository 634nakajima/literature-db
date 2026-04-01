import usePaperStore from '../../store/usePaperStore';

export default function Header() {
  const exportPapers = usePaperStore(s => s.exportPapers);
  const setActiveTab = usePaperStore(s => s.setActiveTab);
  const setSelectedPaper = usePaperStore(s => s.setSelectedPaper);
  const paperCount = usePaperStore(s => s.papers.length);

  const handleLogoClick = () => {
    setSelectedPaper(null);
    setActiveTab('list');
  };

  return (
    <header className="header-accent text-white px-6 py-5 flex items-center justify-between border-b border-slate-700/50">
      <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Lab Logo"
          className="w-9 h-9 rounded-lg"
        />
        <div>
          <h1 className="text-base font-bold tracking-wide leading-tight">
            Affective Information Media Lab.
            <br />
            <span className="text-slate-400 font-normal text-sm">Literature DB</span>
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">{paperCount} papers</span>
        <button
          onClick={exportPapers}
          className="text-xs text-slate-300 border border-slate-600/60 rounded-lg px-4 py-2 hover:bg-white/5 hover:border-slate-500 transition-all cursor-pointer"
        >
          Export JSON
        </button>
      </div>
    </header>
  );
}
