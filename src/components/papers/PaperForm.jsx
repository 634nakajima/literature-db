export default function PaperForm({ data, onChange, onSubmit, isEdit, onCancel, loading }) {
  const set = (k) => (e) => onChange({ ...data, [k]: e.target.value });

  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all";
  const textareaClass = `${inputClass} min-h-[80px] resize-y`;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-base font-bold mb-4">
        {isEdit ? '文献を編集' : '文献を追加'}
      </h3>

      <Field label="タイトル *">
        <input className={inputClass} value={data.title} onChange={set('title')} placeholder="論文タイトル" />
      </Field>

      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="著者">
            <input className={inputClass} value={data.authors} onChange={set('authors')} placeholder="著者名" />
          </Field>
        </div>
        <div className="w-24">
          <Field label="年">
            <input className={inputClass} value={data.year} onChange={set('year')} placeholder="2024" type="number" />
          </Field>
        </div>
      </div>

      <Field label="会議名 / 雑誌名">
        <input className={inputClass} value={data.venue} onChange={set('venue')} placeholder="NIME 2023" />
      </Field>

      <Field label="要旨">
        <textarea className={textareaClass} value={data.abstract} onChange={set('abstract')} placeholder="論文の要旨" />
      </Field>

      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="DOI">
            <input className={inputClass} value={data.doi} onChange={set('doi')} placeholder="10.xxxx/xxxxx" />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="URL">
            <input className={inputClass} value={data.url} onChange={set('url')} placeholder="https://..." />
          </Field>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="キーワード (カンマ区切り)">
            <input className={inputClass} value={data.keywords} onChange={set('keywords')} placeholder="haptics, DMI, NIME" />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="タグ (カンマ区切り)">
            <input className={inputClass} value={data.tags} onChange={set('tags')} placeholder="要読, 関連研究" />
          </Field>
        </div>
      </div>

      <Field label="メモ">
        <textarea className={textareaClass} value={data.notes} onChange={set('notes')} placeholder="自由メモ" />
      </Field>

      <Field label="BibTeX">
        <textarea
          className={`${textareaClass} font-mono text-xs`}
          value={data.bibtex}
          onChange={set('bibtex')}
          placeholder="@inproceedings{...}"
        />
      </Field>

      <div className="flex gap-2 mt-2">
        <button
          onClick={onSubmit}
          disabled={loading || !data.title.trim()}
          className="px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '保存中...' : isEdit ? '更新' : '追加'}
        </button>
        {isEdit && (
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-md bg-white text-slate-900 text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            キャンセル
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3.5">
      <label className="text-xs font-semibold text-slate-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
