# 我的 Hexo 博客：日常配置与发布

博客根目录是 `D:\Blog\hexo-blog`。请在这个目录打开 PowerShell 运行命令。文章与页面的原稿保存在 `source/`，自动生成的 `public/` 可以随时重新构建，不要在里面直接写文章。

## 在哪里修改网页

| 想修改的内容 | 文件或位置 |
| --- | --- |
| 网站标题、作者、描述、将来的网址 | `_config.yml` |
| 导航菜单、首页短句、侧栏、搜索、字数、页脚 | `_config.butterfly.yml` |
| 文章 | `source/_posts/` 中的 Markdown 文件 |
| “关于”页面 | `source/about/index.md` |
| 友链数据 | `source/_data/link.yml` |
| 分类和标签页面 | `source/categories/index.md` 与 `source/tags/index.md`；分类和标签的具体内容从文章自动汇总 |
| 图片 | 放进 `source/img/`，文章或配置里使用 `/img/文件名.png` |

主题本身安装在 `node_modules/hexo-theme-butterfly/`，不要直接修改。自己的设置写在根目录的 `_config.butterfly.yml`，升级时更容易保留。

### 换头像与简介

把头像图片放到 `source/img/avatar.png`，再在 `_config.butterfly.yml` 中加入或修改：

```yaml
avatar:
  img: /img/avatar.png
  effect: false

aside:
  card_author:
    description: 这里写一句个人简介
```

已有的 `aside` 段落请直接编辑，不要在同一文件里再写第二个 `aside:`。网站作者名在 `_config.yml` 的 `author:`；首页标题下的短句在 `_config.butterfly.yml` 的 `subtitle.sub`。

### 新的卡片外观、封面和背景

当前是深色图文卡片：桌面端左右交错，手机端图片在上、文字在下。卡片进入屏幕时轻轻浮现，鼠标悬停时上浮、封面缓慢放大；系统开启“减少动态效果”时自动关闭这些动画。右下角的设置里仍能切换明暗。

每篇文章开头添加 `cover: /img/你的封面.jpg` 即可设置封面，图片放在 `source/img/`。优先使用横图。没有封面时使用随项目提供的笔记本插画；不想显示封面时写 `cover: false`。`description:` 控制卡片摘要，不填时自动截取正文。

在 `_config.butterfly.yml` 中编辑已有字段：

```yaml
background: /img/background.jpg # 整个网站背后的背景
index_img: /img/banner.jpg      # 仅首页顶部横幅；可以继续留空
```

两处图片可以只填其一。背景图片放在 `source/img/`，图片偏亮时建议先压暗，让文字保持清晰。未设置图片时使用默认深绿灰底色。

自定义外观写在 `source/css/journal.css`，动画写在 `source/js/journal.js`，由主题配置末尾的 `inject` 引入。无需修改主题安装目录。若要恢复原生 Butterfly 外观，可移除这两个 `inject` 引用。

### 写文章

```powershell
cd D:\Blog\hexo-blog
pnpm exec hexo new "我的第一篇笔记"
```

新文章会出现在 `source/_posts/`。在文章开头使用下面的格式，分类和标签页面会自动更新：

```markdown
---
title: 我的第一篇笔记
date: 2026-09-25 12:00:00
categories:
  - 学习笔记
tags:
  - 阅读
  - 思考
description: 首页文章卡片上的简短介绍
---

这里开始写正文。
```

当前 `source/_posts/start-here.md` 是演示文章，请在正式公开前改写或删除。`source/about/index.md` 也有待替换的占位文字。

### 本地查看

```powershell
cd D:\Blog\hexo-blog
pnpm run server
```

打开 <http://localhost:4000/>。保存 Markdown 或配置后刷新页面。若页面仍显示旧内容，停止服务器后运行 `pnpm run clean`、`pnpm run build`，再启动服务器。

要查看包含两篇排版示例草稿的完整卡片效果，改为运行 `pnpm run preview`。草稿在 `source/_drafts/`，`pnpm run build` 与 GitHub 自动部署均不发布草稿。主题配置修改后需要用 Ctrl+C 停止服务器并重新启动。

## 发布到 GitHub Pages

确定要用的 GitHub 账号后，在 GitHub 创建一个**公开**的空仓库，名称必须是 `你的用户名.github.io`。随后：

1. 将 `_config.yml` 中的 `url:` 改为 `https://你的用户名.github.io`。
2. 把 `_config.yml` 中的 `author:` 改成你希望显示的名字。按需修改 `_config.butterfly.yml` 中的头像、简介和背景。
3. 在博客目录运行：

   ```powershell
   git add .
   git commit -m "Configure my blog"
   git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
   git push -u origin main
   ```

4. 在仓库的 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions**。仓库已有 `.github/workflows/pages.yml`，以后推送到 `main` 会自动构建并发布网站。

如果 `git remote add origin` 提示已存在，请先用 `git remote -v` 查看，不要重复添加。首次发布通常要等 Actions 构建完成后才能访问。

参考：[示例博客](https://youweiyu.github.io/)、[其公开仓库](https://github.com/youweiyu/youweiyu.github.io)、[Butterfly 主题页面文档](https://butterfly.js.org/posts/dc584b87/)、[Butterfly 主题配置文档](https://butterfly.js.org/posts/4aa8abbe/)。示例仓库只有生成后的静态网页，不能直接得到它的原始 `_config.butterfly.yml`。
