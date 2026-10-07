'use strict';

// Hexo's default generators omit the homepage/archive/feed when there are no posts.
hexo.extend.generator.register('empty-blog', function(locals) {
  if (locals.posts.length) return [];
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;'}[ch]));
  const base = this.config.url.replace(/\/$/, '') + this.config.root;
  const feed = '<?xml version="1.0" encoding="utf-8"?>' +
    '<feed xmlns="http://www.w3.org/2005/Atom"><title>' + escape(this.config.title) + '</title>' +
    '<id>' + escape(base) + '</id><link href="' + escape(base) + '"/>' +
    '<link href="' + escape(base + 'atom.xml') + '" rel="self"/>' +
    '<updated>' + new Date().toISOString() + '</updated></feed>';
  return [
    {path:'index.html', layout:['index'], data:{posts:locals.posts, current:1, total:1, prev:0, next:0, base:''}},
    {path:'archives/index.html', layout:['archive'], data:{posts:locals.posts, title:'归档', archive:true, current:1, total:1}},
    {path:'atom.xml', data:feed}
  ];
});
