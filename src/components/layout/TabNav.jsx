import usePaperStore from '../../store/usePaperStore';

const TABS = [
  { id: 'list', label: '一覧', icon: '☰' },
  { id: 'add', label: '追加', icon: '+' },
  { id: 'search', label: '検索', icon: '⌕' },
  { id: 'network', label: 'ネットワーク', icon: '◎' },
  { id: 'timeline', label: 'タイムライン', icon: '―' },
  { id: 'gaps', label: 'ギャップ', icon: '▦' },
  { id: 'import', label: 'インポート', icon: '↓' },
];

export default function TabNav({ editMode, onResetForm }) {
  const activeTab = usePaperStore(s => s.activeTab);
  const setActiveTab = usePaperStore(s => s.setActiveTab);
  const setSelectedPaper = usePaperStore(s => s.setSelectedPaper);

  const handleTabClick = (tabId) => {
    if (tabId === 'add' && activeTab !== 'add') {
      onResetForm?.();
    }
    if (tabId === 'list') {
      setSelectedPaper(null);
    }
    setActiveTab(tabId);
  };

  return (
    <nav className="tab-nav flex overflow-x-auto bg-white/80 backdrop-blur-sm border-b border-slate-200/80 px-2 md:px-4">
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        const label = tab.id === 'add' && editMode ? '編集' : tab.label;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`group flex items-center gap-1.5 px-4 py-3 text-[13px] whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              isActive
                ? 'text-blue-600 font-semibold border-blue-600'
                : 'text-slate-400 font-normal border-transparent hover:text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className={`text-[11px] ${isActive ? 'opacity-80' : 'opacity-40 group-hover:opacity-60'}`}>
              {tab.icon}
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
