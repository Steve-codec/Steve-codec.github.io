# Rare UI in Time machine

This directory integrates selected Rare UI React components into this personal Hexo website. It is part of the blog application, not a component library or a reusable theme distribution.

Source downloaded from the official Rare UI registry on 2026-10-07:

- Gooey Nav: https://www.rareui.com/components/gooeynav
- Rail TOC: https://www.rareui.com/components/railtoc
- Scroll Progress: https://www.rareui.com/components/scrollprogressindicator
- Folder: https://www.rareui.com/components/foldercomponent
- Registry: https://github.com/swamimalode07/rare-ui/tree/main/public/r

Copyright (c) 2026 Swami Malode. Rare UI: https://rareui.com

Full terms are preserved in `vendor/LICENSE.txt` and in the compiled JavaScript banners. The live site credits Rare UI in its footer. The components use React and Motion; `compat.tsx` provides compatibility helpers for the Hexo site. The Scroll Progress menu's accessible label is translated into Chinese. Folder adaptations are described below.

Run `pnpm run build:ui` to rebuild the assets. `pnpm run build` includes that step before Hexo generation. `styles.css` generates the used Tailwind utilities without its global reset. Blog-specific styles live in `themes/firefly/source/css/refinements.css`.

Rail TOC enhances the sidebar while the original TOC remains the fallback before loading. Scroll Progress supplies the mobile article menu. Full page navigation remains enabled. Gooey Nav was removed from the entry point: replacing pre-rendered links with React and animating their spacing introduced a visible layout change on every page load. The duplicated content navigation was then removed from all page templates at the user's request. The original downloaded Gooey Nav source is retained for reference, but is not shipped in the JavaScript bundle.

The Hexo filter in `scripts/image-dimensions.js` reserves intrinsic dimensions for local article images. This prevents newly loaded figures from moving a selected section after a TOC jump.

The React reading bundle loads only on article pages. Home, archive, and category navigation works without loading or parsing it.

The category index loads a separate `category-folders.js` bundle. Hexo renders category names, article links, and counts before JavaScript runs. The Folder component's animations stay inside a fixed stage; opening reveals those article links. Local adaptations add keyboard operation, reduced-motion support, persistent open state, a callback, and unique SVG filter IDs. The duplicated content navigation is removed from page templates; the main header navigation remains.

The translucent flap retains its SVG fill, but its backdrop blur is disabled to avoid edge smearing in the browser's 3D compositor.
# 分类卡片布局调整

Folder 新增 xs 尺寸，保持内部透视距离固定，再整体缩小，避免小尺寸下展开面板过度拉伸。分类卡片使用横向布局：小文件夹、分类名称与文章预览；最新文章始终可读，另外两篇由文件夹按钮展开。链接和分类数量仍由 Hexo 生成，未加载 JavaScript 时文章列表仍可阅读。
