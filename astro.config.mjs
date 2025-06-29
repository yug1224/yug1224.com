// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  image: {
    remotePatterns: [
      {
        protocol: 'https',
      },
    ],
  },
  integrations: [sitemap()],
  server: {
    host: true,
  },
  site: 'https://yug1224.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
