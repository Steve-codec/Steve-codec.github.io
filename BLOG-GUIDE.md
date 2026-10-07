# 我的 Hexo 博客：Firefly 配置与发布

博客目录：`D:\Blog\hexo-blog`。当前使用 Firefly 主题，文章仍由 Hexo 管理。

## 修改位置

| 内容 | 文件或位置 |
| --- | --- |
| 网站标题、作者、介绍、正式网址 | `_config.yml` |
| 背景、头像、首页打字短句、颜色、侧栏 | `themes/firefly/_config.yml` |
| 正式文章 | `source/_posts/` |
| 草稿 | `source/_drafts/` |
| 关于页面 | `source/about/index.md` |
| 图片 | `source/img/` |

按照 Firefly 项目建议，直接编辑 `themes/firefly/_config.yml`。不要同时添加根目录 `_config.firefly.yml` 或 `theme_config`，否则数组合并可能留下演示菜单、社交链接或背景图。

当前已开启社交链接、音乐、评论入口、纯文字动态、相册、追番和访客统计，也保留静态背景横幅、波浪、打字效果、图文卡片、明暗切换、主题色选择、本地搜索和正文目录。已加入 Vagrant Poet，评论尚未连接服务，GitHub 已连接 Steve-codec，Bilibili 个人空间待填写。看板娘与赞助已关闭。各模块的素材位置、数据格式和配置步骤见 [MODULES-GUIDE.md](MODULES-GUIDE.md)。

## 首页短句和图片

主题配置的 `home_text.title` 是首页大标题；`home_text.subtitle` 是轮流打字的句子：

```yaml
home_text:
  title: 我的博客
  subtitle:
    - 记录笔记与思考
    - 把一闪而过的想法，慢慢写下来
  typewriter:
    enable: true
    speed: 100
    delete_speed: 50
    pause_time: 2000
```

请编辑已有段落，不要重复添加同名配置。网站标题同时修改根目录 `_config.yml` 的 `title`。

头像是 `source/img/avatar.png`；背景是 `source/img/banner.jpg`，可直接替换同名文件。使用其他文件名时，在主题配置修改 `profile.avatar`、`logo.url`、`favicon` 或 `wallpaper.src`：

```yaml
wallpaper:
  mode: banner
  src:
    - desktop: /img/banner.jpg
      mobile: /img/banner.jpg
```

图片路径以 `/img/` 开头，不填磁盘路径。主题色在 `theme_color.hue`（0–360），默认明暗在 `theme_color.default_mode`（dark、light、system）。浏览器会记住显示偏好，手动选择的颜色与明暗可能覆盖配置默认值。

## 写文章和封面

在博客目录打开 PowerShell：

```powershell
cd D:\Blog\hexo-blog
pnpm exec hexo new "我的第一篇笔记"
```

编辑新生成的 Markdown 文件，文章开头示例：

```markdown
---
title: 我的第一篇笔记
date: 2026-10-07 12:00:00
categories:
  - 学习笔记
tags:
  - 阅读
description: 首页卡片上的介绍
cover: /img/cover.jpg
---

这里开始写正文。
```

封面图片放进 `source/img/`，未填写时使用笔记插画。分类、标签、归档、搜索索引会在生成时更新。旧文章已移出博客，目前已发布 DLCV 学习笔记，文件为 `source/_posts/dlcv-notes.md`；配图与封面在 `source/img/posts/dlcv/`。公式使用本地 KaTeX 渲染，写法见这篇文章；关于页介绍为“遇见有趣的人和事”。

## 本地预览

```powershell
cd D:\Blog\hexo-blog
pnpm run preview
```

打开 <http://127.0.0.1:4000/>，保持终端运行。`preview` 还会显示草稿；`pnpm run server` 只显示正式文章。目前功能预览草稿已移出，两种方式均显示 DLCV 学习笔记。保存文章后刷新页面，修改配置后用 Ctrl+C 停止并重新运行预览。若仍显示旧内容，停止预览后运行 `pnpm run clean` 再启动，并用 Ctrl+F5 刷新浏览器。

## 发布到 GitHub Pages

博客网址：https://steve-codec.github.io/ 。仓库：https://github.com/Steve-codec/Steve-codec.github.io 。本地 origin 已连接该仓库，Pages 已选择 GitHub Actions。

以后修改文章、动态、图片或配置后，在博客目录运行：

```powershell
cd D:\Blog\hexo-blog
git add .
git commit -m "Update blog"
git push
```

推送到 main 后，`.github/workflows/pages.yml` 会自动安装依赖、构建并发布；仅在本地保存不会更新公网。可以在仓库 Actions 查看本次发布是否成功。正式构建不发布草稿，source/_dynamics 中的动态会随正式网站发布。

构建环境固定使用 Asia/Shanghai 时区，避免线上文章网址与本地日期相差一天。主题源码包含在 themes/firefly 中，会一起上传。

运行时长从主题配置 `site.site_start_date` 开始计算，目前为 2026-09-25，表示建站至今经过的天数，与电脑或预览终端是否运行无关。

## 主题版本与更新

来源：[LKDenchin/hexo-theme-firefly](https://github.com/LKDenchin/hexo-theme-firefly)。目前作者标记为开发者预览，已固定保存这次安装的源码，不会自行更新。版本与兼容性调整见 `themes/firefly/LOCAL-CHANGES.md`。

更新前先提交本地修改，保留主题配置，再合并上游新版与本地调整，不要覆盖自己的配置。以前的 `_config.butterfly.yml` 与 journal 样式文件保留用于恢复，当前主题不加载它们。

## 完整模块预览（2026-10-07）

旧演示文章和草稿已经移到 `D:\Blog\backups\before-full-preview-20261007-171748`，功能预览草稿已由正式的 DLCV 学习笔记替换；该草稿保存在 `D:\Blog\backups\before-personal-media-20261007\firefly-preview.md`。原始笔记和图片保留在 `D:\Blog\materials\DLCV-20261007`。相册、追番与动态提供预览内容，后续按 [MODULES-GUIDE.md](MODULES-GUIDE.md) 替换即可。



