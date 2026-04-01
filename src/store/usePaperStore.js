import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { toRecord, isDuplicate } from '../lib/helpers';

const usePaperStore = create(
  persist(
    (set, get) => ({
      papers: [],
      activeTab: 'list',
      selectedPaper: null,
      filterTag: null,
      filterKeyword: null,
      sortBy: 'added_desc',
      loading: true,
      error: null,
      success: null,

      clearAlerts: () => set({ error: null, success: null }),

      setActiveTab: (tab) => set({ activeTab: tab, error: null, success: null }),

      setSelectedPaper: (paper) => set({ selectedPaper: paper }),

      setFilterTag: (tag) => set(state => ({
        filterTag: state.filterTag === tag ? null : tag,
      })),

      setFilterKeyword: (keyword) => set(state => ({
        filterKeyword: state.filterKeyword === keyword ? null : keyword,
      })),

      setSortBy: (sortBy) => set({ sortBy }),

      clearFilters: () => set({ filterTag: null, filterKeyword: null }),

      // Fetch all papers from Supabase
      fetchPapers: async () => {
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from('papers')
            .select('*')
            .order('added_at', { ascending: false });

          if (error) throw error;
          set({ papers: data || [], loading: false, error: null });
        } catch (e) {
          console.error('Fetch error:', e?.message || e);
          // Fall back to cached data
          set(state => ({
            loading: false,
            error: state.papers.length > 0
              ? 'オフラインモード: キャッシュデータを表示中'
              : `データの読み込みに失敗しました: ${e?.message || 'Supabaseに接続できません。テーブルが作成済みか確認してください。'}`,
          }));
        }
      },

      // Add a paper
      addPaper: async (formData) => {
        const record = toRecord(formData);
        // Remove id so Supabase generates UUID
        const { id: _id, ...insertData } = record;

        try {
          const { data, error } = await supabase
            .from('papers')
            .insert([insertData])
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            papers: [data, ...state.papers],
            success: '文献を追加しました',
            activeTab: 'list',
            selectedPaper: null,
          }));
          return true;
        } catch (e) {
          set({ error: `追加に失敗しました: ${e.message}` });
          return false;
        }
      },

      // Update a paper
      updatePaper: async (id, formData) => {
        const record = toRecord(formData);
        const { id: _id, added_at: _added, ...updateData } = record;

        try {
          const { data, error } = await supabase
            .from('papers')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            papers: state.papers.map(p => p.id === id ? data : p),
            success: '文献を更新しました',
            activeTab: 'list',
            selectedPaper: null,
          }));
          return true;
        } catch (e) {
          set({ error: `更新に失敗しました: ${e.message}` });
          return false;
        }
      },

      // Delete a paper
      deletePaper: async (id) => {
        try {
          const { error } = await supabase
            .from('papers')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            papers: state.papers.filter(p => p.id !== id),
            success: '削除しました',
            selectedPaper: null,
          }));
        } catch (e) {
          set({ error: `削除に失敗しました: ${e.message}` });
        }
      },

      // Import papers from JSON
      importPapers: async (jsonArray) => {
        const existing = get().papers;
        const toInsert = [];

        for (const p of jsonArray) {
          const record = toRecord(p);
          if (!isDuplicate(existing, record)) {
            const { id: _id, ...insertData } = record;
            toInsert.push(insertData);
          }
        }

        if (toInsert.length === 0) {
          set({ success: 'すべての文献が既に登録済みです' });
          return;
        }

        try {
          const { data, error } = await supabase
            .from('papers')
            .insert(toInsert)
            .select();

          if (error) throw error;

          set(state => ({
            papers: [...(data || []), ...state.papers],
            success: `${data?.length || 0}件の文献を追加しました`,
          }));
        } catch (e) {
          set({ error: `インポートに失敗しました: ${e.message}` });
        }
      },

      // Export papers as JSON
      exportPapers: () => {
        const papers = get().papers;
        const blob = new Blob([JSON.stringify(papers, null, 2)], {
          type: 'application/json',
        });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'literature-db.json';
        a.click();
        URL.revokeObjectURL(a.href);
      },

    }),
    {
      name: 'literature-db-cache',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ papers: state.papers }),
    }
  )
);

export default usePaperStore;
