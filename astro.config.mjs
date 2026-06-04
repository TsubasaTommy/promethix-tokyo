import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://promethix-tokyo.com',
  compressHTML: true,
  // site 設定済みのため sitemap-index.xml / sitemap-0.xml を自動生成（robots.txt から参照）
  integrations: [sitemap()],
  build: {
    // 16KB の外部CSSをHTMLにインライン化（単一ページ＝キャッシュ分割の損失ゼロ、render-blocking 解消）
    inlineStylesheets: 'always',
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [400, 500, 600, 700, 800], // 現状CDNと同一・全て使用中
      styles: ['normal'], // italic未使用 → 生成対象を半減（既定は normal+italic）
      subsets: ['latin'],
      fallbacks: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Hiragino Sans',
        'Yu Gothic UI',
        'Segoe UI',
        'sans-serif',
      ],
      // optimizedFallbacks 既定 true → 末尾 generic family を基準にメトリクス整合 @font-face を自動生成し CLS 抑制
    },
  ],
});
