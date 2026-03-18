import { useState, useRef } from 'react';
import usePaperStore from '../../store/usePaperStore';

export default function ImportExportView() {
  const importPapers = usePaperStore(s => s.importPapers);
  const exportPapers = usePaperStore(s => s.exportPapers);
  const [jsonText, setJsonText] = useState('');
  const fileRef = useRef(null);

  const handleImport = async () => {
    try {
      let parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) parsed = [parsed];
      await importPapers(parsed);
      setJsonText('');
    } catch (e) {
      usePaperStore.setState({ error: `インポートエラー: ${e.message}` });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) parsed = [parsed];
      await importPapers(parsed);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      usePaperStore.setState({ error: `ファイル読み込みエラー: ${err.message}` });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-base font-bold mb-2">インポート / エクスポート</h3>
      <p className="text-sm text-slate-500 mb-4 leading-relaxed">
        JSON形式（単体またはリスト）を貼り付けるか、ファイルをアップロードして一括登録できます。
      </p>

      {/* File upload */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-500 mb-1 block">
          JSONファイルをアップロード
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 file:cursor-pointer"
        />
      </div>

      {/* Text paste */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-500 mb-1 block">
          またはJSONを直接貼り付け
        </label>
        <textarea
          className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs font-mono min-h-[200px] resize-y outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          placeholder='[{"title": "...", "authors": "...", "year": 2024}]'
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleImport}
          disabled={!jsonText.trim()}
          className="px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          インポート実行
        </button>
        <button
          onClick={exportPapers}
          className="px-5 py-2 rounded-md bg-white text-slate-900 text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          エクスポート
        </button>
      </div>
    </div>
  );
}
