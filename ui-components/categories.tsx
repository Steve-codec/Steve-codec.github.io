import React from 'react';
import { createRoot } from 'react-dom/client';
import { Folder } from './vendor/folder-component';

document.querySelectorAll<HTMLElement>('.category-folder-visual').forEach(host => {
  const card = host.closest<HTMLElement>('.category-folder-card');
  if (!card || host.dataset.enhanced) return;
  const label = host.dataset.label || '分类';
  const list = card.querySelector<HTMLElement>('.category-folder-posts');
  const extraPosts = card.querySelectorAll<HTMLElement>('.category-folder-post-extra');
  const hint = card.querySelector<HTMLElement>('.category-folder-hint');
  if (!list) return;
  host.dataset.enhanced = 'true';
  card.dataset.open = 'false';
  extraPosts.forEach(post => { post.inert = true; post.hidden = true; });
  createRoot(host).render(<Folder color="blue" size="xs" label={`展开或收起“${label}”最近文章`} onOpenChange={open => {
    card.dataset.open = String(open);
    extraPosts.forEach(post => { post.inert = !open; post.hidden = !open; });
    if (hint) hint.textContent = extraPosts.length ? (open ? '再次点击收起' : '点击展开最近文章') : '这份收藏，慢慢积累';
  }} />);
});
