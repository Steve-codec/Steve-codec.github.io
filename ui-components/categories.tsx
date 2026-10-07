import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Folder } from './vendor/folder-component';

const roots: Root[] = [];
function dispose() { roots.splice(0).forEach(root => root.unmount()); }
function init() { document.querySelectorAll<HTMLElement>('.category-folder-visual').forEach(host => {
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
  const root = createRoot(host); roots.push(root);
  root.render(<Folder color="blue" size="xs" label={`展开或收起“${label}”最近文章`} onOpenChange={open => {
    card.dataset.open = String(open);
    extraPosts.forEach(post => { post.inert = !open; post.hidden = !open; });
    if (hint) hint.textContent = extraPosts.length ? (open ? '再次点击收起' : '点击展开最近文章') : '这份收藏，慢慢积累';
  }} />);
}); }
(window as any).CategoryFolders = {init, dispose};
document.addEventListener('page:dispose', dispose);
init();
