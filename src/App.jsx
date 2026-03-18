import { useState, useEffect } from 'react';
import usePaperStore from './store/usePaperStore';
import { EMPTY, toForm } from './lib/helpers';
import PasswordGate from './components/layout/PasswordGate';
import Header from './components/layout/Header';
import TabNav from './components/layout/TabNav';
import PaperList from './components/papers/PaperList';
import PaperForm from './components/papers/PaperForm';
import SearchView from './components/search/SearchView';
import ImportExportView from './components/import-export/ImportExportView';
import NetworkGraph from './components/visualizations/NetworkGraph';
import TimelineView from './components/visualizations/TimelineView';
import ResearchGapView from './components/visualizations/ResearchGapView';

export default function App() {
  const activeTab = usePaperStore(s => s.activeTab);
  const setActiveTab = usePaperStore(s => s.setActiveTab);
  const fetchPapers = usePaperStore(s => s.fetchPapers);
  const addPaper = usePaperStore(s => s.addPaper);
  const updatePaper = usePaperStore(s => s.updatePaper);
  const setSelectedPaper = usePaperStore(s => s.setSelectedPaper);
  const error = usePaperStore(s => s.error);
  const success = usePaperStore(s => s.success);
  const clearAlerts = usePaperStore(s => s.clearAlerts);
  const loading = usePaperStore(s => s.loading);

  const [form, setForm] = useState({ ...EMPTY });
  const [editMode, setEditMode] = useState(false);

  // Fetch papers on mount
  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // Auto-clear alerts
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearAlerts, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success, clearAlerts]);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    let ok;
    if (editMode && form.id) {
      ok = await updatePaper(form.id, form);
    } else {
      ok = await addPaper(form);
    }
    if (ok) {
      setForm({ ...EMPTY });
      setEditMode(false);
    }
  };

  const handleEdit = (paper) => {
    setForm(toForm(paper));
    setEditMode(true);
    setActiveTab('add');
  };

  const handleResetForm = () => {
    setForm({ ...EMPTY });
    setEditMode(false);
    setSelectedPaper(null);
  };

  return (
    <PasswordGate>
    <div className="min-h-screen bg-slate-50 text-slate-900 text-sm">
      <Header />
      <TabNav editMode={editMode} onResetForm={handleResetForm} />

      <main className="max-w-[960px] mx-auto px-5 py-5">
        {/* Alerts */}
        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-2.5 rounded-md text-sm bg-green-50 text-green-800 border border-green-200">
            {success}
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'list' && <PaperList onEdit={handleEdit} />}

        {activeTab === 'add' && (
          <PaperForm
            data={form}
            onChange={setForm}
            onSubmit={handleSubmit}
            isEdit={editMode}
            onCancel={() => {
              handleResetForm();
              setActiveTab('list');
            }}
            loading={loading}
          />
        )}

        {activeTab === 'search' && <SearchView />}
        {activeTab === 'network' && <NetworkGraph />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'gaps' && <ResearchGapView />}
        {activeTab === 'import' && <ImportExportView />}
      </main>
    </div>
    </PasswordGate>
  );
}
