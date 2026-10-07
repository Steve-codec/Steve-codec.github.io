'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { imageSize } = require('image-size');
const dimensions = new Map();

// Reserve space before local article images load so TOC jumps stay in place.
hexo.extend.filter.register('after_post_render', function(data) {
  const sourceRoot = path.resolve(hexo.source_dir);
  function reserveSpace(html) {
    return html.replace(/<img\b[^>]*>/gi, function(tag) {
      if (/\s(?:width|height)\s*=/i.test(tag)) return tag;
      const match = tag.match(/\ssrc\s*=\s*(["'])(.*?)\1/i);
      if (!match || !match[2].startsWith('/') || match[2].startsWith('//')) return tag;
      try {
        const src = decodeURIComponent(match[2].split(/[?#]/)[0]);
        const file = path.resolve(sourceRoot, '.' + src);
        const relative = path.relative(sourceRoot, file);
        if (relative.startsWith('..') || path.isAbsolute(relative)) return tag;
        if (!dimensions.has(file)) dimensions.set(file, imageSize(fs.readFileSync(file)));
        const { width, height } = dimensions.get(file);
        if (!(width > 0 && height > 0)) return tag;
        return tag.replace(/\s*\/?\s*>$/, ` width="${width}" height="${height}">`);
      } catch (_) {
        return tag;
      }
    });
  }
  for (const field of ['content', 'excerpt', 'more']) {
    if (typeof data[field] === 'string') data[field] = reserveSpace(data[field]);
  }
  return data;
}, 20);
