# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

```sh
pnpm dev        # 開発サーバー起動 (http://localhost:4321)
pnpm build      # 静的ファイルを dist/ に出力
pnpm preview    # ビルド結果をローカルプレビュー
```

- パッケージマネージャは **pnpm**（`pnpm-lock.yaml` / `pnpm-workspace.yaml` で管理）。
- テストランナー・リンタの設定はない。変更の妥当性チェックは実質 `pnpm build` が通るかどうか。型は `tsconfig.json` が `astro/tsconfigs/strict` を継承して厳格。
- **Node バージョン**: pnpm CLI は Node ≥22.13（LTS）が必要。この環境のシェルは既定で nvm LTS（≥22.13）が有効なため、`pnpm` をそのまま実行してよい（`nvm use --lts` を毎回挟む必要はない）。万一古い Node に落ちて起動エラーになった場合のみ `nvm use --lts` するか、最終手段として `node_modules/.bin/astro dev|build|preview` を直接叩く。

## アーキテクチャ概要

Astro 6 製の静的コーポレートサイト（受託開発会社 Promethix LLC）。ルーティングはファイルベースだが、**実体は単一ページ構成**で、全コンテンツが `src/pages/index.astro` に集約された1枚もののランディングページ。外部 API・CMS 連携はなし。

**データ駆動パターン**: `index.astro` のフロントマター（`---` ブロック）で配列（`strengths` / `services` / `works` / `flowSteps` / `plans` / `overview` / `techStack` / `faqs`）を定義し、テンプレート側で `.map()` してセクションを描画する。コピーや実績を増減するときは、HTML を直接いじるのではなく **これらの配列を編集する**のが基本。

**セクションとアンカーナビの同期**: `index.astro` の各 `<section>` は `id`（`hero` / `about` / `services` / `works` / `tech` / `process` / `faq` / `company` / `contact`）を持ち、`Header.astro` の `nav` 配列・`Footer.astro` の `footerNav` 配列がその `#id` にリンクする。セクションを追加・改名したら **`Header.astro` と `Footer.astro` の両方の配列も合わせて更新する**こと（`scroll-margin-top` は global.css で設定済みなのでヘッダー被りは自動回避）。

**レイアウト**: `src/layouts/Base.astro` が全ページ共通の HTML シェル（`<head>`・フォント読み込み・スキップリンク・`Header`/`<slot />`/`Footer`）。Props は `title` / `description?` / `ogImage?` / `jsonLd?` / `noindex?` を受け取る。

**SEO / 構造化データ**: `Base.astro` の `<head>` で robots meta・canonical・OGP（`og:image` は `/og.png` をデフォルトに `Astro.site` で絶対URL化）・Twitter Card（`summary_large_image`）・JSON-LD を出力する。JSON-LD は会社情報の二重管理を避けるため **`index.astro` のフロントマターで `jsonLd`（schema.org の `@graph`: Organization+ProfessionalService / WebSite / FAQPage）を組み立て**、`<Base jsonLd={jsonLd}>` で渡す。FAQPage は `faqs` 配列から自動生成される（本文と構造化データの単一ソース）。サイトマップは `@astrojs/sitemap`（`astro.config.mjs` の `integrations`）が `sitemap-index.xml` を自動生成し、`public/robots.txt` から参照している。OGP/アイコン画像（`public/og.png` / `logo.png` / `apple-touch-icon.png`）の編集用ソース SVG と再生成手順は `design/` にある。

**パスエイリアス**: `@/*` → `src/*`（`tsconfig.json`）。

## スタイリング

- `src/styles/global.css` の `:root` に **デザイントークン**（カラー・角丸・シャドウ・コンテナ幅・フォント）を集約。ブランドカラーは `--color-accent: #6366f1`（サブ `--color-accent-2: #06b6d4`、`--gradient-accent` でグラデーション）。配色変更はこの変数を編集する。
- **ユーティリティクラス**も global.css に定義: `.btn`（`--primary` / `--ghost`）, `.card`, `.section`（`--soft`）, `.section__header`, `.container`, `.grid--2` / `.grid--3`, `.eyebrow`, `.gradient-text`, `.fade-up`, `.muted`, `.center`。
- ページ・コンポーネント固有のスタイルは各 `.astro` の `<style>` ブロック（スコープ CSS）。**`index.astro` のスコープ CSS は同ファイル内の全セクションで共有される**点に注意（例: Works セクションは Services 用の `.service-card__icon` を再利用している）。

**クライアントサイドの挙動は `index.astro` の `<script>` に集約**:
- `.fade-up` + `IntersectionObserver` によるスクロール出現アニメーション。新しい要素をフェードインさせたいときは `fade-up` クラスを付けるだけでよい（observer が一括監視）。
- `[data-copy]` 属性のボタンでクリップボードコピー（お問い合わせメールのコピー UI）。

## 編集ガイド

| 変更したい内容 | 対象 |
|---|---|
| Hero の見出し・数字 | `src/pages/index.astro`（Hero セクション内の `hero__stats`） |
| 強み（About の3項目） | `src/pages/index.astro` の `strengths` 配列 |
| サービス内容 | `src/pages/index.astro` の `services` 配列 |
| 開発実績（Works） | `src/pages/index.astro` の `works` 配列 |
| 開発の進め方（フロー） | `src/pages/index.astro` の `flowSteps` 配列 |
| 契約形態・料金・体制（Process） | `src/pages/index.astro` の `plans` 配列 / Process セクション |
| 対応技術スタック（Tech） | `src/pages/index.astro` の `techStack` 配列 |
| よくある質問（FAQ） | `src/pages/index.astro` の `faqs` 配列（FAQPage 構造化データも同配列から生成） |
| 会社概要 | `src/pages/index.astro` の `overview` 配列 |
| 構造化データ（JSON-LD） | `src/pages/index.astro` の `jsonLd`（`Base.astro` が `<head>` に出力） |
| title / meta description | `src/pages/index.astro` の `<Base>` 呼び出し（`Base.astro` が会社名サフィックスを付与） |
| OGP / アイコン画像 | `public/og.png` / `logo.png` / `apple-touch-icon.png`（ソースは `design/*.svg`、再生成は `design/README.md`） |
| グローバルナビ | `src/components/Header.astro` の `nav` 配列（＋ `Footer.astro` の `footerNav` 配列） |
| お問い合わせ先メール | `src/pages/index.astro`（mailto / `data-copy`）と `src/components/Footer.astro` の2箇所 |
| フッター・コピーライト | `src/components/Footer.astro` |
| 配色・タイポグラフィ | `src/styles/global.css`（`:root` 変数） |

**Works（実績）掲載時の制約**: 守秘義務のため、プロジェクトのコードネーム・クライアント名・業界（ドメイン）は記載しない。掲載してよいのは「システム種別・機能・規模感・公開されている技術スタック」まで。

## デプロイ

`pnpm build` で `dist/` に静的ファイルを生成（`compressHTML: true`）。`astro.config.mjs` の `site` は本番ドメイン `'https://promethix-tokyo.com'` に設定済み（canonical / OGP 絶対URL / sitemap の基準）。ドメインを変える場合は `site` のほか、`public/robots.txt` の `Sitemap:` 行と `index.astro` の `jsonLd` 内 URL（`SITE` 定数）も合わせて更新する。
