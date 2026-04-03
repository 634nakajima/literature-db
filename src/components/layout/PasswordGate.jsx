import { useState, useEffect } from 'react';

const HASH = 'af7a89b86d64271301d67812bc304ae55ded3c4835abdbd0a9221ef8a57af25d';
const STORAGE_KEY = 'literature-db-auth';

async function sha256(text) {
  const encoded = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function PasswordGate({ children }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check saved auth on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved === 'true') {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hash = await sha256(input);
    if (hash === HASH) {
      setAuthed(true);
      setError(false);
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } else {
      setError(true);
      setInput('');
    }
  };

  if (checking) return null;

  if (authed) return children;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Logo"
            className="w-16 h-16 mx-auto mb-4 rounded-xl"
          />
          <h1 className="text-white text-lg font-bold">
            Affective Information Media Lab.
          </h1>
          <p className="text-slate-400 text-sm mt-1">Literature DB</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false); }}
              placeholder="パスワードを入力"
              autoFocus
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs">パスワードが正しくありません</p>
          )}

          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
