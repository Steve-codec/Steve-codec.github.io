# Rare UI in Time machine

This directory integrates selected Rare UI React components into this personal Hexo website. It is part of the blog application, not a component library or a reusable theme distribution.

Source downloaded from the official Rare UI registry on 2026-10-07:

- Gooey Nav: https://www.rareui.com/components/gooeynav
- Rail TOC: https://www.rareui.com/components/railtoc
- Scroll Progress: https://www.rareui.com/components/scrollprogressindicator
- Registry: https://github.com/swamimalode07/rare-ui/tree/main/public/r

Copyright (c) 2026 Swami Malode. Rare UI: https://rareui.com

Full terms are preserved in `vendor/LICENSE.txt` and in the compiled JavaScript banner. The live site credits Rare UI in its footer. The components use React and Motion; `compat.tsx` replaces Next.js navigation helpers with normal links for the Hexo site. The Scroll Progress menu's accessible label is translated into Chinese. The component animation code is otherwise retained.

Run `pnpm run build:ui` to rebuild the assets. `pnpm run build` includes that step before Hexo generation. `styles.css` generates the used Tailwind utilities without its global reset. Blog-specific styles live in `themes/firefly/source/css/refinements.css`.

Rail TOC enhances the sidebar while the original TOC remains the fallback before loading. Scroll Progress supplies the mobile article menu. Full page navigation remains enabled. Gooey Nav was removed from the entry point: replacing pre-rendered links with React and animating their spacing introduced a visible layout change on every page load. The content navigation now renders directly in Hexo with fixed-size pills and color-only hover feedback. The original downloaded Gooey Nav source is retained for reference, but is not shipped in the JavaScript bundle.

The Hexo filter in `scripts/image-dimensions.js` reserves intrinsic dimensions for local article images. This prevents newly loaded figures from moving a selected section after a TOC jump.
