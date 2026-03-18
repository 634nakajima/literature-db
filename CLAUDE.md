# Literature DB

文献管理・可視化Webアプリケーション。Supabase + React + GitHub Pages。

## 技術スタック
- React 18 + Vite 6
- Tailwind CSS 4
- Zustand (状態管理 + localStorageキャッシュ)
- Supabase (PostgreSQL)
- Cytoscape.js (ネットワークグラフ)
- D3.js (タイムライン・ヒートマップ)

## 開発
```bash
npm run dev   # 開発サーバー起動 (port 5173)
npm run build # ビルド → dist/
```

## Supabase
- URL: https://ygnmlkgfrlfvgfpfkkbj.supabase.co
- テーブル: `papers`
- REST API で読み書き（anon keyで認証）
- `.env` に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定

## 文献追加（Claude Code経由）
`/add-paper` コマンドでcurl経由でSupabase APIに直接INSERT可能。
`/search-papers` コマンドで既存データの検索が可能。

## デプロイ
mainブランチにpushするとGitHub Actionsで自動デプロイ。
GitHub Secretsに `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定する必要あり。
