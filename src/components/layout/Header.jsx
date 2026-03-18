import usePaperStore from '../../store/usePaperStore';

export default function Header() {
  const exportPapers = usePaperStore(s => s.exportPapers);
  const paperCount = usePaperStore(s => s.papers.length);

  return (
    <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold tracking-wide">Literature DB</h1>
        <p className="text-sm text-slate-400">
          文献データベース — {paperCount}件
        </p>
      </div>
      <button
        onClick={exportPapers}
        className="text-xs text-slate-400 border border-slate-600 rounded-md px-3 py-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
      >
        JSONエクスポート
      </button>
    </header>
  );
}
