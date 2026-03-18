# 文献DBを検索

Supabase上のLiterature DBから文献を検索します。

## 全件取得

```bash
curl -s "https://ygnmlkgfrlfvgfpfkkbj.supabase.co/rest/v1/papers?select=id,title,authors,year,venue,keywords,tags&order=added_at.desc" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

## タイトルで検索

```bash
curl -s "https://ygnmlkgfrlfvgfpfkkbj.supabase.co/rest/v1/papers?title=ilike.*検索語*&select=*" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

## キーワードで検索

```bash
curl -s "https://ygnmlkgfrlfvgfpfkkbj.supabase.co/rest/v1/papers?keywords=cs.{keyword}&select=*" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

## タグで検索

```bash
curl -s "https://ygnmlkgfrlfvgfpfkkbj.supabase.co/rest/v1/papers?tags=cs.{タグ名}&select=*" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

## 環境変数

`SUPABASE_ANON_KEY` が未設定の場合は以下の値を使用:
`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnbm1sa2dmcmxmdmdmcGZra2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjUyMTUsImV4cCI6MjA4OTI0MTIxNX0.GHIMAC8E5JQj-YhXeqi_0EHnCctnXYhEBPwuOqrpzOE`

Supabase URL: `https://ygnmlkgfrlfvgfpfkkbj.supabase.co`
