const path = require('node:path');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const esbuild = require('esbuild');
const root = path.join(__dirname, '..');
const output = path.join(root, 'themes/firefly/source');
fs.mkdirSync(path.join(output, 'js/ui'), { recursive: true });
for (const [entry, filename] of [['index.tsx', 'rare-components.js'], ['categories.tsx', 'category-folders.js']]) esbuild.buildSync({
  entryPoints: [path.join(root, 'ui-components', entry)],
  outfile: path.join(output, 'js/ui', filename),
  bundle: true, minify: true, sourcemap: false, format: 'iife', target: ['es2020'],
  jsx: 'automatic', define: {'process.env.NODE_ENV': '"production"'},
  alias: {'next/link':path.join(root,'ui-components/compat.tsx'),'next/navigation':path.join(root,'ui-components/compat.tsx'),'@/lib/utils':path.join(root,'ui-components/compat.tsx')},
  banner: {js:'/* Rare UI — https://rareui.com\n'+fs.readFileSync(path.join(root,'ui-components/vendor/LICENSE.txt'),'utf8')+'\n*/'},
});
const cli = path.join(path.dirname(require.resolve('@tailwindcss/cli/package.json')), 'dist/index.mjs');
execFileSync(process.execPath, [cli, '-i', path.join(root,'ui-components/styles.css'), '-o', path.join(output,'css/rare-utilities.css'), '--minify'], {cwd:root,stdio:'inherit'});
console.log('Built Rare UI components for Hexo.');
