'use strict';
const markedKatex = require('marked-katex-extension');
hexo.extend.filter.register('marked:extensions', function(extensions) {
  extensions.push(...markedKatex({throwOnError: true, nonStandard: true, trust: false}).extensions);
});
