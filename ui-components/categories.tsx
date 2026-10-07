import React from 'react';
import { createRoot } from 'react-dom/client';
import { Folder } from './vendor/folder-component';

document.querySelectorAll<HTMLElement>('.category-folder-visual').forEach(host => {
  const card = host.closest<HTMLElement>('.category-folder-card');
  if (!card || host.dataset.enhanced) return;
  const label = host.dataset.label || '分类';
  const list = card.querySelector<HTMLElement>('.category-folder-posts');
  const hint = card.querySelector<HTMLElement>('.category-folder-hint');
  if (!list) return;
  host.dataset.enhanced = 'true';
  card.dataset.open = 'false';
  list.inert = true;
  list.setAttribute('aria-hidden', 'true');
  createRoot(host).render(<Folder color="blue" size="sm" label={`打开“${label}”文件夹`} onOpenChange={open => {
    card.dataset.open = String(open);
    list.inert = !open;
    list.setAttribute('aria-hidden', String(!open));
    if (hint) hint.textContent = open ? '选择一篇文章，开始阅读' : '点击文件夹，翻开这份收藏';
  }} />);
});
