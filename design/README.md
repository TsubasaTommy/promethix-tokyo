# design/ — ブランド画像のソース

`public/` に配置している PNG（OGP画像・ロゴ・アイコン）の**編集用ソース SVG**です。
配色を変えたい、コピーを変えたい場合はここの SVG を編集し、下記コマンドで PNG を再生成します。

| ソース | 出力先 | 用途 |
|---|---|---|
| `og.svg` | `public/og.png`（1200×630） | OGP / Twitter Card 画像（`og:image`） |
| `logo.svg` | `public/logo.png`（512×512） | 構造化データ Organization の `logo` |
| `apple-touch-icon.svg` | `public/apple-touch-icon.png`（180×180） | iOS ホーム画面アイコン |

## 再生成

SVG→PNG のラスタライズには Astro が依存として持つ `sharp`（日本語はシステムフォントで描画）を使います。
pnpm はトランジティブ依存を hoist しないため、`.pnpm` 配下を `createRequire` で参照します。

```sh
node -e '
const { createRequire } = require("module");
const { readFileSync, writeFileSync } = require("fs");
const g = require("glob"); // 不要。下のパスは sharp のバージョンに合わせて調整
'
```

実際には次の使い捨てスクリプトで生成しています（`sharp@x.y.z` のバージョン部分は `ls node_modules/.pnpm | grep "^sharp@"` で確認して合わせる）:

```js
// gen.mjs
import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
const base = new URL('./node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json', import.meta.url);
const sharp = createRequire(base)('sharp');
const jobs = [
  ['design/og.svg', 'public/og.png'],
  ['design/logo.svg', 'public/logo.png'],
  ['design/apple-touch-icon.svg', 'public/apple-touch-icon.png'],
];
for (const [src, out] of jobs) {
  writeFileSync(out, await sharp(readFileSync(src)).png({ compressionLevel: 9 }).toBuffer());
}
```

```sh
node gen.mjs
```

> SVG の `font-family` に `Hiragino Sans` 等のシステムフォントを指定しているため、日本語が正しく描画されます。
> `og.png` を差し替えたら SNS のキャッシュが残るため、X / Facebook / Slack の OGP デバッガで再取得してください。
