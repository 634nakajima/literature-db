# 文献をDBに追加

ユーザーが指定した論文情報をSupabase上のLiterature DBに追加します。

## 手順

1. ユーザーから論文情報を受け取る（タイトル、著者、年、会議名/雑誌名、要旨、DOI、URL、キーワード、タグなど）
2. 以下のcurlコマンドでSupabase REST APIに直接INSERTする

```bash
curl -s "https://ygnmlkgfrlfvgfpfkkbj.supabase.co/rest/v1/papers" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -X POST \
  -d '[{
    "title": "論文タイトル",
    "authors": "著者名",
    "year": 2024,
    "venue": "会議名",
    "abstract": "要旨",
    "doi": "",
    "url": "",
    "keywords": ["keyword1", "keyword2"],
    "tags": ["関連研究"],
    "notes": "",
    "bibtex": ""
  }]'
```

環境変数 `SUPABASE_ANON_KEY` が未設定の場合は以下の値を使用:
`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnbm1sa2dmcmxmdmdmcGZra2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjUyMTUsImV4cCI6MjA4OTI0MTIxNX0.GHIMAC8E5JQj-YhXeqi_0EHnCctnXYhEBPwuOqrpzOE`

3. レスポンスを確認し、追加された文献情報をユーザーに報告する

## 複数件追加

複数の論文を一度に追加する場合は、配列として送信できる。

## Web検索結果からの追加

Web検索（semanticSearch等）で論文情報を見つけた場合、その情報を整理してこのコマンドで追加できる。
キーワードやタグは文脈に応じて適切に設定する。

## 注意事項

- `title` は必須フィールド
- `keywords` と `tags` はTEXT配列として送信する（`["a", "b"]` 形式）
- 重複チェックはサーバー側では行わないため、追加前にタイトルやDOIで既存データを確認すること

## 重複確認

追加前に既存データを確認するには:
```bash
curl -s "https://ygnmlkgfrlfvgfpfkkbj.supabase.co/rest/v1/papers?title=ilike.*検索語*&select=id,title" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```
