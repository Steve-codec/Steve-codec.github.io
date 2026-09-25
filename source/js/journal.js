/* 单次滚动入场；支持减少动画偏好与 Butterfly 的可选 Pjax。 */
(() => {
  let observer;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reveal = () => {
    if (observer) observer.disconnect();
    document.querySelectorAll('.journal-pending').forEach(card => card.classList.remove('journal-pending'));
    if (motion.matches || !('IntersectionObserver' in window)) return;

    observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.remove('journal-pending');
        target.classList.add('journal-enter');
        observer.unobserve(target);
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('#recent-posts .recent-post-item:not(.journal-enter)').forEach(card => {
      // 回退浏览器历史时，不隐藏已滚过的文章。
      if (card.getBoundingClientRect().bottom <= 0) return;
      card.classList.add('journal-pending');
      observer.observe(card);
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', reveal, { once: true });
  else reveal();
  document.addEventListener('pjax:complete', reveal);
  window.addEventListener('pageshow', reveal);
  motion.addEventListener('change', reveal);
})();
