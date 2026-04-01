import { useEffect, useRef } from 'react';
import usePaperStore from '../store/usePaperStore';

/**
 * ブラウザ履歴とZustandのナビゲーション状態を同期するフック。
 * タブ切り替えや論文選択時にpushStateし、ブラウザの戻るボタンで
 * サイト内ナビゲーションを巻き戻せるようにする。
 */
export default function useHistorySync() {
  const activeTab = usePaperStore(s => s.activeTab);
  const selectedPaper = usePaperStore(s => s.selectedPaper);
  const setActiveTab = usePaperStore(s => s.setActiveTab);
  const setSelectedPaper = usePaperStore(s => s.setSelectedPaper);

  // プログラム的な状態復元中かどうかのフラグ（pushStateの二重発火を防ぐ）
  const isRestoringRef = useRef(false);
  // 初回マウント時にreplaceStateで初期状態を記録済みかどうか
  const initializedRef = useRef(false);

  // 初期状態をreplaceStateで記録
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const state = { tab: activeTab, paperId: selectedPaper?.id || null };
      window.history.replaceState(state, '');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // activeTab / selectedPaper が変わったらpushState
  useEffect(() => {
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }
    if (!initializedRef.current) return;

    const state = { tab: activeTab, paperId: selectedPaper?.id || null };
    const current = window.history.state;

    // 同じ状態ならpushしない
    if (current && current.tab === state.tab && current.paperId === state.paperId) {
      return;
    }

    window.history.pushState(state, '');
  }, [activeTab, selectedPaper]);

  // popstate（戻る／進む）でZustand状態を復元
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;
      if (!state || !state.tab) return;

      isRestoringRef.current = true;

      // selectedPaper の復元
      if (state.paperId) {
        const papers = usePaperStore.getState().papers;
        const paper = papers.find(p => p.id === state.paperId);
        setSelectedPaper(paper || null);
      } else {
        setSelectedPaper(null);
      }

      setActiveTab(state.tab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab, setSelectedPaper]);
}
