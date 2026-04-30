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

3. Web検索などで論文の内容を調査し、`notes` フィールドに**1000字以上の日本語**で詳細な解説を記述する。以下の観点を含めること：
   - 研究の背景・問題意識
   - 提案手法・概念の詳細説明
   - 実験・評価の概要（あれば）
   - 研究上の意義と関連研究との位置づけ

   **notes記述時の厳守事項：**
   - **原文の用語・表現を尊重する**：論文が使っている専門用語や概念名はそのまま使用し、別の言葉で言い換えない。言い換えによって元の意味やニュアンスが変わるリスクがあるため。
   - **結果・結論を正確に記述する**：著者が述べている結果や結論を、自分の解釈で曖昧にしたり一般化したりしない。具体的な数値（p値、効果量、人数等）がある場合は必ず記載する。
   - **著者の主張と自分の解釈を混同しない**：「〜と論じている」「〜と主張する」など、著者の見解であることを明示する。自分の推測や拡大解釈を著者の主張として書かない。
   - **因果関係や論理展開を改変しない**：著者が「AはBに寄与する可能性がある」と書いているのを「AはBを引き起こす」と断定的に書き換えるなど、論理の強さを変えない。
   - **省略による歪曲を避ける**：要約のために情報を省略する際、省略によって元の主張の文脈や条件が失われないよう注意する。
   - **原文を確認できない場合は明記する**：全文にアクセスできず抄録のみから記述した場合はその旨を注記する。
   - **原文以外の情報源からの引用を明記する**：原文にアクセスできず、出版社サイト・書評・作家ウェブサイト・GitHub等の外部情報源から記述した場合は、各情報の引用元（例：「Ars Electronicaの作品記述によれば」「KAKENの公開情報によれば」）を明記する。引用元が特定できない情報は記載しない。全文未確認の場合、notesは確認可能な情報のみに絞り、1000字未満で簡潔に記述してよい。
4. レスポンスを確認し、追加された文献情報をユーザーに報告する

## 複数件追加

複数の論文を一度に追加する場合は、配列として送信できる。

## Web検索結果からの追加

Web検索（semanticSearch等）で論文情報を見つけた場合、その情報を整理してこのコマンドで追加できる。
キーワードやタグは文脈に応じて適切に設定する。

## 注意事項

- `title` は必須フィールド
- `keywords` と `tags` はTEXT配列として送信する（`["a", "b"]` 形式）
- 重複チェックはサーバー側では行わないため、追加前にタイトルやDOIで既存データを確認すること

## タグ付けの指針

以下のタグ体系に従って付与すること：

| タグ | 意味 |
|------|------|
| `Multimodal/Crossmodal Affectivity` | マルチモーダルまたはクロスモーダルな感情・感覚研究全般 |
| `Crossmodal Affectivity` | クロスモーダル（感覚間）な感情・知覚研究 |
| `Enactive Affectivity` | エナクティヴィズムに基づく感情・身体性研究 |
| `Hapsonic Art` | 触覚と音響を組み合わせたアート・インタフェース研究 |
| `Digital Kineticism` | デジタル運動感覚・動きに関する研究 |

**重要ルール：`Crossmodal Affectivity` タグを付ける場合は、必ず `Multimodal/Crossmodal Affectivity` タグも同時に付けること。**
（`Multimodal/Crossmodal Affectivity` は「multimodal affectivity または crossmodal affectivity」を意味する上位タグのため）

## 重複確認

追加前に既存データを確認するには:
```bash
curl -s "https://ygnmlkgfrlfvgfpfkkbj.supabase.co/rest/v1/papers?title=ilike.*検索語*&select=id,title" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```
