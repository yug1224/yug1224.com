import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  image: {
    remotePatterns: [{
      protocol: 'https',
    }],
  },
  integrations: [tailwind(), sitemap()],
  server: {
    host: true,
  },
  site: 'https://yug1224.com',
});
