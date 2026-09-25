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

### 换头像、简介和 GitHub 按钮

把头像图片放到 `source/img/avatar.png`，再在 `_config.butterfly.yml` 中加入或修改：

```yaml
avatar:
  img: /img/avatar.png
  effect: false

aside:
  card_author:
    description: 这里写一句个人简介
    button:
      enable: true
      icon: fab fa-github
      text: Follow Me
      link: https://github.com/你的用户名
```

已有的 `aside` 段落请直接编辑，不要在同一文件里再写第二个 `aside:`。网站作者名在 `_config.yml` 的 `author:`；首页标题下的短句在 `_config.butterfly.yml` 的 `subtitle.sub`。

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

## 发布到 GitHub Pages

确定要用的 GitHub 账号后，在 GitHub 创建一个**公开**的空仓库，名称必须是 `你的用户名.github.io`。随后：

1. 将 `_config.yml` 中的 `url:` 改为 `https://你的用户名.github.io`。
2. 把 `_config.yml` 中的 `author:` 改成你希望显示的名字。按需修改 `_config.butterfly.yml` 中的头像、简介、公告和 GitHub 按钮。
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
