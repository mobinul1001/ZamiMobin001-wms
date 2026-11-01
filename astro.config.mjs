import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://websitemaintenanceservices.org',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // Only indexable canonical URLs belong in the sitemap.
      filter: (page) => !/^\/(admin|thank-you|404|get-a-free-quote|free-website-maintenance-audit)(\/|$)/.test(new URL(page).pathname),
    }),
  ],
});
