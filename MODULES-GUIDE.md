# Firefly 完整模块：素材与内容放置说明

博客目录：`D:\Blog\hexo-blog`。当前保留社交、音乐、评论、纯文字动态、相册、追番和访客统计；看板娘、赞助、打赏入口已关闭。旧文章和两篇旧草稿移到了 `D:\Blog\backups\before-full-preview-20261007-171748`，不再显示或发布。功能预览草稿也已移至 `D:\Blog\backups\before-personal-media-20261007\firefly-preview.md`，由正式的 DLCV 学习笔记替换。文章在 `source/_posts/dlcv-notes.md`，24 张配图与 SVG 封面在 `source/img/posts/dlcv/`。

## 内容和素材放在哪里

| 内容 | 素材目录 | 内容配置 |
| --- | --- | --- |
| 音乐文件、歌词 | `source/music/`，支持 MP3、WAV 等浏览器可播放格式；歌词为 LRC | `source/_data/music.yml` |
| 音乐封面 | `source/img/music/` | 同上，填写 cover |
| 相册照片 | `source/img/gallery/` | `source/_data/gallery.yml` |
| 追番封面 | `source/img/bangumi/` | `source/_data/bangumi.yml` |
| 纯文字动态 | 不需要图片 | `source/_dynamics/` 中的 Markdown |
| 友链 | `source/img/` 中放头像 | `source/_data/friends.yml` |
| 文章 | `source/_posts/` | Markdown 原稿 |
| 头像/背景 | `source/img/avatar.png`、`source/img/banner.jpg` | `themes/firefly/_config.yml` |
| 社交链接、评论账号、访客统计 | 不需要上传素材 | 主题配置 social、comments、analytics |

相册与追番当前使用主题自带图片和明确标注的预览卡片，后续可直接替换。GitHub 已填写 https://github.com/Steve-codec；Bilibili 仍标明“待设置”，目前指向平台首页。收到个人空间链接或 UID 后，在主题配置 social 和 profile.links 两处更新。RSS、留言板使用本博客链接。

当前背景使用第一张图片，复制到 `source/img/banner.jpg`；音乐封面使用第二张图片，复制到 `source/img/music/vagrant-poet.jpg`。原图和原音频未改动。旧背景与赞助页面保存在 `D:\Blog\backups\before-personal-media-20261007`。

## 添加音乐

例如将歌曲放到 `source/music/song.mp3`，封面放到 `source/img/music/cover.jpg`，再编辑 `source/_data/music.yml`：

```yaml
playlist:
  - name: 歌曲名
    artist: 歌手名
    url: /music/song.mp3
    cover: /img/music/cover.jpg
    lrc: /music/song.lrc
```

没有歌词时删除 lrc 一行；多首歌就在 playlist 下面继续添加，不要重复添加 playlist。当前已加入 Vagrant Poet — 洛仃洋，文件为 `source/music/vagrant-poet.mp3`，封面为 `source/img/music/vagrant-poet.jpg`。默认不自动播放，点击播放按钮开始；普通页面跳转会中断播放。

## 添加相册与追番

`source/_data/gallery.yml`：相册写在 albums 下，照片列表写在 images 下，每张图片填写 src 和 caption。上传路径例如 `/img/gallery/photo.jpg`。

`source/_data/bangumi.yml`：条目写在 items 下。status 可为 watching（在看）、planned（想看）、completed（看过）；填写 title、cover、progress、description，封面例如 `/img/bangumi/poster.jpg`。

所有网页路径从 `/` 开始，不填 `D:\...` 磁盘路径。

## 写动态

在 `source/_dynamics/` 新建一个 Markdown 文件：

```markdown
---
title: 今日随想
date: 2026-10-07 12:00:00
avatar: /img/avatar.png
---

这里写动态正文。
```

当前的 preview.md 是动态演示，替换或删除即可。动态目前随正式网站一起发布；它与仅本地显示的文章草稿不同。

## 社交链接、评论和访客统计

社交链接编辑 `themes/firefly/_config.yml` 的 social，填写你自己的个人主页，不必编辑其他页面。

评论使用 Giscus，已连接 `Steve-codec/Steve-codec.github.io`，仓库 Discussions 已开启，分类为 Announcements。仓库 ID 与分类 ID 已填入主题配置，Giscus 应用已安装，线上文章已验证显示评论输入区与 GitHub 登录入口。以下安装步骤仅供以后重新安装或更换仓库时参考：

1. 登录 GitHub，打开 https://github.com/apps/giscus ，点击 Install。
2. 选择 Only select repositories，仅勾选 `Steve-codec.github.io`，完成安装。
3. 刷新博客文章或留言板，确认出现登录与评论输入区。尚未安装时显示“评论服务准备中”。

不需要把访问令牌或密码写进配置。安装后，文章、留言板、关于和友链页面会自动加载真实评论，每个页面有独立讨论；第一条留言会自动建立讨论。评论保存在仓库的 Discussions，访客需登录 GitHub。若某篇文章不需要评论，在开头元信息填写 `comments: false`。若以后更换评论仓库，再到 https://giscus.app/zh-CN 生成新的 ID。若希望访客无需 GitHub 账号，可另选 Waline 或 Twikoo，但需要部署相应评论服务。

访客统计使用不蒜子，配置 analytics.busuanzi 和 footer.visitor_counter。已移除主题原本随机生成、保存在浏览器中的备用数字。本地不加载统计服务，只显示横线；发布后由服务返回真实访问计数。浏览量是页面加载次数，刷新或换页可能增加；访客计数按服务规则去重，不能当作精确人数。服务加载失败时不会编造数字。侧栏“文章、分类、总字数”是内容统计，只在内容变化后更新。

## 本地预览与发布

### 界面组件与音乐反馈

内容导航、文章目录和手机阅读进度使用 Rare UI 的组件，来源说明在 `ui-components/README.md`，页脚保留来源链接。日常写文章不需要改这些组件。整体间距、卡片和播放器样式集中在 `themes/firefly/source/css/refinements.css`；修改组件源码后运行 `pnpm run build:ui`，正常发布构建也会自动执行。

音乐仍编辑 `source/_data/music.yml`；播放后按钮变为暂停，等待音频时显示缓冲提示。未点击播放前不会自动播放。音乐文件和封面位置保持不变。

### 手动调整头像裁切

原图保存在 `source/img/avatar.png`，无需修改原图。在 `themes/firefly/_config.yml` 的 `profile` 中调整：

```yaml
  avatar_position: '50% 15%'
  avatar_zoom: 1.15
```

第一个百分比控制横向焦点，第二个控制纵向焦点；纵向越小，越能保留图片上方。人物偏下时可从 `15%` 继续减小。`avatar_zoom` 控制放大倍数，`1` 不额外放大，`1.15` 轻微放大，最大 `2`。导航头像和个人资料头像共用这些设置。调整后重启本地预览，满意后提交并推送即可更新线上。

### 刷新旧页面

GitHub Pages 和浏览器会缓存页面，首页与子页面的缓存更新时间可能不同。已发布新版本但仍显示旧名称时，按 `Ctrl + F5` 强制刷新。主题配置 `asset_version` 是本地样式与脚本的缓存版本；修改它们后更新此值再发布。

```powershell
cd D:\Blog\hexo-blog
pnpm run preview
```

打开 http://127.0.0.1:4000/，保持终端运行。首页左右侧栏展示各模块；导航“生活”内有相册、追番和留言板。

配置修改后停止并重新启动预览；音乐或图片上传后刷新。浏览器会保存配色、明暗和特效偏好；壁纸固定为横幅模式，旧壁纸偏好会自动归为横幅。同一页面重复点击导航只回到顶部。站内导航使用无刷新跳转，播放器保留，播放进度、暂停状态和循环模式会延续；没有侧栏的页面暂时隐藏播放器，可用顶部音乐按钮控制。手动刷新、关闭网页或打开新标签会重新加载播放器，需要再次点击播放。不蒜子计数随完整页面加载更新，站内无刷新跳转不额外统计一次浏览。

正式网址已填写为 https://steve-codec.github.io，作者为 Hugh；相册、追番和动态的预览内容可继续按需替换。GitHub Actions 已连接，推送 main 后自动构建发布。正式构建不包含文章草稿，没有正式文章时仍能生成首页、归档与 RSS。

网站已上线；本地保存不会自动上传，提交并推送至 GitHub 后才会更新公网。详细建站与发布步骤见 BLOG-GUIDE.md，主题本地调整见 themes/firefly/LOCAL-CHANGES.md。



