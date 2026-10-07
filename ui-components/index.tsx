import React from 'react';
import { createRoot } from 'react-dom/client';
import { GooeyNav } from './vendor/gooey-nav';
import RailToc from './vendor/rail-toc';
import ScrollProgress from './vendor/scroll-progress';

function mountEnhancements() {
  document.querySelectorAll<HTMLElement>('.content-nav-bar').forEach(bar => {
    if (bar.dataset.enhanced) return;
    const links = [...bar.querySelectorAll<HTMLAnchorElement>('a.content-nav-item')];
    if (!links.length) return;
    const items = links.map(link => ({
      label: link.classList.contains('content-nav-home') ? '首页' : (link.querySelector('.nav-item-label')?.textContent || link.textContent || '').trim() + (link.querySelector('.nav-item-count') ? ` · ${link.querySelector('.nav-item-count')!.textContent}` : ''),
      href: link.pathname.replace(/\/$/, '') || '/',
    }));
    const selected = Math.max(0, links.findIndex(link => link.classList.contains('active')));
    const host = document.createElement('div');
    host.className = 'rare-nav-host';
    bar.replaceChildren(host);
    bar.dataset.enhanced = 'true';
    createRoot(host).render(<GooeyNav items={items} defaultValue={selected} size="sm" separation={8} radius={12} activeColor="var(--primary)" activeLabelColor="#052e24" aria-label="内容导航" />);
  });

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
      createRoot(host).render(<RailToc items={items} title="阅读路线" offset={88} indent={12} className="rare-rail-toc" />);
      const progress = document.createElement('div');
      progress.className = 'rare-progress-host';
      document.body.appendChild(progress);
      const sections = items.filter(item => item.depth === 0).map(item => ({id:item.id, label:item.label.length > 18 ? item.label.slice(0,18) + '…' : item.label}));
      createRoot(progress).render(<ScrollProgress sections={sections} offset={88} />);
      const floating = document.querySelector<HTMLElement>('.floating-toc-panel');
      if (floating) {
        const mobileHost = document.createElement('div');
        mobileHost.className = 'rare-rail-host';
        floating.replaceChildren(mobileHost);
        createRoot(mobileHost).render(<RailToc items={items} title="阅读路线" offset={88} indent={12} className="rare-rail-toc" />);
      }
    }
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountEnhancements);
else mountEnhancements();
