import usePaperStore from '../../store/usePaperStore';
import { useFilteredPapers } from '../../hooks/usePaperData';
import PaperCard from './PaperCard';
import PaperDetail from './PaperDetail';
import FilterBar from './FilterBar';

export default function PaperList({ onEdit }) {
  const papers = usePaperStore(s => s.papers);
  const loading = usePaperStore(s => s.loading);
  const selectedPaper = usePaperStore(s => s.selectedPaper);
  const setSelectedPaper = usePaperStore(s => s.setSelectedPaper);
  const deletePaper = usePaperStore(s => s.deletePaper);
  const filteredPapers = useFilteredPapers();

  if (selectedPaper) {
    return (
      <PaperDetail
        paper={selectedPaper}
        onBack={() => setSelectedPaper(null)}
        onEdit={onEdit}
        onDelete={deletePaper}
      />
    );
  }

  if (loading) {
    return <div className="text-center py-10 text-slate-400 text-sm">読み込み中...</div>;
  }

  if (papers.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        文献がまだ登録されていません。<br />
        「追加」または「インポート」タブから文献を登録してください。
      </div>
    );
  }

  return (
    <div>
      <FilterBar />
      {filteredPapers.map(p => (
        <PaperCard key={p.id} paper={p} onClick={setSelectedPaper} />
      ))}
    </div>
  );
}
