// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const lazyMarkdownMedia = () => {
  return (tree) => {
    const visit = (node) => {
      if (!node || typeof node !== 'object') return;

      if (node.type === 'element' && node.tagName === 'img') {
        node.properties ||= {};
        node.properties.loading ||= 'lazy';
        node.properties.decoding ||= 'async';
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    };

    visit(tree);
  };
};

// https://astro.build/config
export default defineConfig({
  site: 'https://meshan.dev',
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [lazyMarkdownMedia],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
});
