import usePaperStore from '../../store/usePaperStore';
import { EMPTY } from '../../lib/helpers';

const TABS = [
  { id: 'list', label: '一覧' },
  { id: 'add', label: '追加' },
  { id: 'search', label: '検索' },
  { id: 'network', label: 'ネットワーク' },
  { id: 'timeline', label: 'タイムライン' },
  { id: 'gaps', label: 'ギャップ' },
  { id: 'import', label: 'インポート' },
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
    <nav className="tab-nav flex overflow-x-auto bg-white border-b border-slate-200 px-4 md:px-6">
      {TABS.map(tab => {
        const isActive = activeTab === tab.id || (activeTab === 'add' && tab.id === 'add' && editMode);
        const label = tab.id === 'add' && editMode ? '編集' : tab.label;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              isActive
                ? 'text-blue-600 font-semibold border-blue-600'
                : 'text-slate-500 font-normal border-transparent hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
