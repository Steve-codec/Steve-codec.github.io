import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import RailToc from './vendor/rail-toc';
import ScrollProgress from './vendor/scroll-progress';

const roots: Root[] = [];
let progressHost: HTMLElement | null = null;
function dispose() {
  roots.splice(0).forEach(root => root.unmount());
  progressHost?.remove();
  progressHost = null;
}

function mountEnhancements() {
  const body = document.querySelector<HTMLElement>('#toc-body');
  const article = document.querySelector<HTMLElement>('.markdown-body');
  if (body && article && !body.dataset.enhanced) {
    const headings = [...article.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6')];
    const minLevel = Math.min(...headings.map(h => Number(h.tagName[1])));
    const items = headings.map((heading, i) => ({
      id: heading.id || (heading.id = `heading-${i}`),
      label: heading.textContent!.trim().replace(/^(?:\d+(?:\.\d+)+\s+|\d+[.、)]\s+)/, ''),
      depth: Math.max(0, Number(heading.tagName[1]) - minLevel),
    }));
    if (items.length) {
      (window as any).TOC?.observer?.disconnect();
      body.dataset.enhanced = 'true';
      const host = document.createElement('div');
      host.className = 'rare-rail-host';
      body.replaceChildren(host);
      const tocRoot = createRoot(host); roots.push(tocRoot);
      tocRoot.render(<RailToc items={items} title="阅读路线" offset={88} indent={12} className="rare-rail-toc" />);
      const progress = document.createElement('div');
      progress.className = 'rare-progress-host';
      document.body.appendChild(progress);
      progressHost = progress;
      const sections = items.filter(item => item.depth === 0).map(item => ({id:item.id, label:item.label.length > 18 ? item.label.slice(0,18) + '…' : item.label}));
      const progressRoot = createRoot(progress); roots.push(progressRoot);
      progressRoot.render(<ScrollProgress sections={sections} offset={88} />);
      const floating = document.querySelector<HTMLElement>('.floating-toc-panel');
      if (floating) {
        const mobileHost = document.createElement('div');
        mobileHost.className = 'rare-rail-host';
        floating.replaceChildren(mobileHost);
        const floatingRoot = createRoot(mobileHost); roots.push(floatingRoot);
        floatingRoot.render(<RailToc items={items} title="阅读路线" offset={88} indent={12} className="rare-rail-toc" />);
      }
    }
  }
}

(window as any).RareReading = {init: mountEnhancements, dispose};
document.addEventListener('page:dispose', dispose);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountEnhancements);
else mountEnhancements();
