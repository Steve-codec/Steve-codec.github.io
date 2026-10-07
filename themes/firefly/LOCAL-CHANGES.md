# 本地安装与调整

- 上游：https://github.com/LKDenchin/hexo-theme-firefly
- 安装日期：2026-10-07
- 上游提交：eddb66995d5f45504011303c082e7fa80f82f60f
- 使用源码副本直接提交到博客仓库，避免部署时缺少主题。

`_config.yml` 已改为个人博客配置，沿用已有背景和头像、移除演示账号与未启用功能。按照上游建议直接编辑此文件，避免根目录覆盖配置合并数组造成残留。

本地兼容性修正：

1. `layout/_partials/header/navigation.ejs`：音乐按钮遵守 music.mode 和 show_in_navbar。
2. `scripts/generators/dynamic.js`：关闭动态页面时不生成空白动态页。
3. `source/js/ui/search.js`：搜索弹窗显示/隐藏时同步 aria-hidden，并在关闭后返回按钮焦点。
4. `layout/_partials/header/banner.ejs`：首页字幕支持多条句子轮播，并使用配置中的打字速度、暂停和开关。
5. `layout/_partials/post/copyright.ejs` 与 `footer-widgets.ejs`：关闭分享和推荐时隐藏相应区块，避免默认打赏链接指向不存在的页面。
6. 分类与标签页面显式指定 layout，确保展示聚合列表；修正中文分类标题的占位文字。

根目录已安装主题脚本直接引用的 moment、hexo-util、hexo-front-matter，并将搜索插件更换为 hexo-generator-search（XML 格式）。添加 hexo-generator-feed，生成主题引用的 atom.xml。

上游更新时请保留个人配置并重新合并上述调整。

## 完整模块预览补充（2026-10-07）

- 全部指定模块已启用；相册、追番、赞助由新增 features/collections.ejs 和 collections.css 展示，数据读取 source/_data 下同名 YAML。
- 评论配置未齐时显示明确标注的预览区；不引用上游作者的评论仓库。
- 本地音乐从 source/_data/music.yml 读取，补上 APlayer 初始化与无歌曲状态。
- 新增 empty-blog.js，保证零篇正式文章时仍生成首页、归档和空 RSS。
- Pjax 暂时关闭，当前用普通跳转，以便完整重新初始化各页面的模块。播放会随页面跳转中断。
- 侧栏和横幅中的站内社交入口改为当前页面跳转，外部平台链接仍新窗口打开。
- 樱花特效初始化增加重复检查，避免出现两层画布。

## 个人素材与精简（2026-10-07）

- 关闭看板娘与赞助，移除社交/导航赞助链接；文章仍保留分享按钮。
- 添加本地 Vagrant Poet 歌曲与封面，换成用户提供的静态背景；关闭背景图片缩放动画。
- 音乐列表折叠修正为 APlayer 支持的 list.hide() 方法。
- 动态预览改为纯文字。
- 移除随机生成访客/浏览数字的 fallback；本地不请求不蒜子，正式域名只使用服务返回的计数。
- 赞助链接改为本博客 /sponsor/；未提供收款码时只展示待添加位置。

## DLCV 正式文章与公式（2026-10-07）

- 功能预览草稿移出 source，以 DLCV 正式学习笔记替换；原稿与原图另存 materials 目录。
- 根目录 scripts/math-rendering.js 为 Marked 注册 KaTeX 扩展，在 Markdown 转义之前解析公式。
- head.ejs 加载本地 source/vendor/katex 的样式与字体；长展示公式可在正文区域横向滚动。
- scripts/helpers/post.js 排除 KaTeX 的重复 MathML 副本，避免字数和阅读时间重复计算同一公式。
- source/img/posts/dlcv/cover.svg 是自行绘制的概念封面，不代表实验结果。

## 友链排版修复（2026-10-07）

- page.ejs 为友链添加独立样式范围、站点数量和外链提示，图片使用固定尺寸且不重复朗读站点名。
- collections.css 补齐友链缺失的布局：桌面双列、手机单列，头像限宽、简介最多两行、键盘焦点与悬停反馈，遵守减少动画偏好。
- 友链数据仍编辑 source/_data/friends.yml。

## 目录去编号（2026-10-07）

- toc.css 移除自动数字圆标，以缩进区分目录层级。
- toc.js 仅在目录标签中移除章/节数字前缀，正文标题与锚点保持原样；用 textContent 创建链接以正确显示标题文字。

## 音乐模式与站点名称（2026-10-07）

- 音乐按钮增加一次性绑定标记，避免 MutationObserver 在图标或提示更新后重置循环模式。
- 循环按钮同时更新 APlayer 的 loop/order 配置，移除重复的自定义 ended 处理；列表循环、单曲循环、随机播放可以反复切换。
- 站点名称统一为 Time machine，公告正文改为 🛖。

## 导航名称与头像裁切（2026-10-07）

- navigation.ejs 为头像增加裁切容器，branding.css 补齐链接横向布局，避免名称显示在头像下方。
- 导航和首页使用 Georgia 衬线字体，导航保持单行名称，窄屏保留名称并调整按钮占用空间。
- profile.avatar_position 与 profile.avatar_zoom 控制导航、个人资料头像的裁切焦点与放大；动态头像共用焦点位置。
- 样式在 responsive.css 之后加载，并更新 theme.asset_version 避免浏览器继续使用旧样式；不修改主题本身的版本号。

## 固定横幅壁纸（2026-10-07）

- 壁纸面板仅展示横幅模式，移除全屏、覆盖、纯色选项和覆盖模式的透明度设置；导航移除三角形切换按钮及对应事件。
- 首屏脚本在样式之前固定 banner，并迁移已保存的旧壁纸模式；body 从生成时就包含 enable-banner，Settings 也只接受 banner，避免加载后再改变模式。
- 已在首页时，重复点击导航首页或站点名称只滚动回顶部；修饰键点击仍保留浏览器的原生行为。
- 本地脚本和样式共用 asset_version，避免旧脚本恢复已移除的模式。

## Rare UI 与音乐反馈（2026-10-07）

- 直接接入 Rare UI 的 Gooey Nav、Rail TOC、Scroll Progress React 组件，使用正常链接兼容 Hexo，保留来源与完整许可证，页脚显示 Rare UI 链接。
- ui-components/build.cjs 打包本地脚本和不含全局重置的 Tailwind 工具样式；pnpm run build 先构建组件再生成 Hexo 页面。
- 内容导航采用弹性分段选中效果；桌面目录使用轨道与纸飞机，手机显示阅读进度及可展开章节菜单。目录继续隐藏章/节编号。
- toc.js 避免重复初始化覆盖 React 目录，并允许卸载原先的目录观察器；没有加载增强脚本时仍使用原目录。
- refinements.css 调整文章卡片、侧栏和播放器的间距、字体与轻微交互反馈，保留静态背景及用户的主题色偏好。
- 音乐控制监听真实 play/pause/waiting/playing 等事件，同步图标、名称和加载状态；预读取音频元数据，不自动播放。歌单通过 APlayer 原生 show/hide 打开与关闭。
# 内容扩展与紧凑分类（2026-10-07）

- categories.ejs 使用横向小型文件夹卡片，最新文章始终可读，另外两篇由按钮展开；全部链接和计数仍由 Hexo 生成。
- Rare UI Folder 增加 xs 尺寸；内部透视距离固定后整体缩放，避免小尺寸展开时面板过度拉伸。继续遵守减少动画偏好并保留键盘操作。
- archive.ejs 使用 page.posts，修正归档分页重复和年份筛选无效；分类总页查询父分类改用 findOne，防止加入子分类后生成空页面。
- search.js 转义结果标题、摘要与链接，高亮文字保持原样。
- checks/content-expansion.cjs 在独立临时博客检查多文章、分页、子分类、搜索、统计与空博客；详见 EXTENSIBILITY-REVIEW.md。
