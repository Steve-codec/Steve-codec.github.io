// Generate fixture content in a separate temporary blog; never touch real articles.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const Hexo = require('hexo');
const root = path.resolve(__dirname, '..');
const checks = [];
const empty = process.argv.includes('--empty');
const verify = (name, fn) => { try { fn(); checks.push({name, passed:true}); } catch(error) { checks.push({name, passed:false, error:error.message}); } };
const work = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'time-machine-content-'));
let hexo;
(async () => {
  for (const name of ['_config.yml', 'package.json', 'source', 'themes', 'scripts', 'scaffolds']) {
    fs.cpSync(path.join(root, name), path.join(work, name), {recursive:true, filter:src => !empty || path.basename(src) !== '_posts'});
  }
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(work, 'node_modules'), 'junction');
  fs.mkdirSync(path.join(work,'source/_posts'),{recursive:true});
  for (let i = 1; !empty && i <= 26; i++) {
    const category = i <= 13 ? ['学习笔记'] : i === 26 ? ['研究', '视觉研究子分类'] : [`收藏 ${i}：很长的分类名称与思考`];
    const title = i === 26 ? '扩展检查 26：很长的文章标题 & <标签>、中文和 English_With_A_Long_Identifier_Without_Spaces' : `扩展检查 ${i}：继续记录与思考`;
    const metadata = {title, date:`${i > 24 ? '2025' : '2026'}-09-${String(i).padStart(2,'0')} 12:00:00`, categories:category, tags:['扩展测试',`主题 ${i}`], description:'多篇文章与分页检查', cover:''};
    fs.writeFileSync(path.join(work,'source/_posts',`expansion-${i}.md`), `---\n${Object.entries(metadata).map(([k,v])=>`${k}: ${JSON.stringify(v)}`).join('\n')}\n---\n\n## 继续学习\n\n扩展检索标记 ${i}，记录笔记与思考。\n\n\`\`\`python\nprint("hello")\n\`\`\`\n`);
  }
  fs.mkdirSync(path.join(work,'source/_drafts'),{recursive:true});
  fs.writeFileSync(path.join(work,'source/_drafts/expansion-private.md'),'---\ntitle: 不应发布的扩展草稿\n---\n草稿独有标记');
  hexo = new Hexo(work,{silent:true});
  await hexo.init();
  await hexo.call('generate');
  const read = name => fs.readFileSync(path.join(work,'public',name),'utf8');
  const exists = route => fs.existsSync(path.join(work,'public',route.endsWith('/') ? route+'index.html' : route));
  const cards = html => [...html.matchAll(/<h2 class="post-card-title">\s*<a href="([^"]+)"/g)].map(m=>m[1]);
  const archives = html => [...html.matchAll(/class="archive-item-title">\s*([^<]+)/g)].map(m=>m[1].trim());
  const pagination = (base, parse, expected) => {
    const paths = [base+'index.html',base+'page/2/index.html',base+'page/3/index.html'];
    const counts = paths.map(p=>parse(read(p)));
    assert.deepEqual(counts.map(p=>p.length),[10,10,expected-20]);
    assert.equal(new Set(counts.flat()).size,expected);
  };
  const posts = hexo.locals.get('posts');
  const categories = hexo.locals.get('categories');
  const tags = hexo.locals.get('tags');
  if (empty) {
    verify('空博客保留首页、归档、分类、标签与订阅',()=>{
      for(const route of ['index.html','archives/index.html','categories/index.html','tags/index.html','atom.xml']) assert.ok(read(route).length>100,route);
      assert.equal(posts.length,0);
      assert.ok(read('categories/index.html').includes('categories-empty'));
      assert.ok(read('tags/index.html').includes('tags-empty'));
    });
    verify('空博客的搜索与日历返回空数据',()=>{
      assert.equal((read('local-search.xml').match(/<entry>/g)||[]).length,0);
      assert.deepEqual(JSON.parse(read('api/allPostMeta.json')),[]);
    });
    console.log(JSON.stringify({articles:0,checks},null,2));
    process.exitCode=checks.some(c=>!c.passed)?1:0;
    return;
  }
  verify('27 篇正式文章，草稿不进入正式构建',()=>assert.equal(posts.length,27));
  verify('首页三页无重复、无遗漏',()=>pagination('',cards,27));
  verify('归档三页无重复、无遗漏',()=>pagination('archives/',archives,27));
  verify('年度归档只展示对应年份',()=>assert.equal(archives(read('archives/2025/index.html')).length,2));
  verify('学习笔记分类自动分页',()=>{
    const cat = categories.findOne({name:'学习笔记'});
    assert.equal(cat.posts.length,14);
    assert.equal(cards(read(cat.path+'index.html')).length,10);
    assert.equal(cards(read(cat.path+'page/2/index.html')).length,4);
  });
  verify('共同标签自动分页',()=>pagination(tags.findOne({name:'扩展测试'}).path,cards,26));
  verify('所有新分类、子分类、标签和文章都有页面',()=>{
    for(const collection of [posts,categories,tags]) collection.forEach(item=>assert.ok(exists(item.path),item.path));
    assert.equal((read('categories/index.html').match(/<section class="category-folder-card/g)||[]).length,categories.length);
    assert.ok(read('categories/index.html').includes('研究 / 子分类'));
  });
  verify('侧栏分类与标签超出设定阈值有更多入口',()=>{
    assert.ok(read('index.html').includes('category-more-btn'));
    assert.ok(read('index.html').includes('tag-more-btn'));
  });
  verify('搜索索引更新且不包含草稿',()=>{
    const xml=read('local-search.xml');
    assert.equal((xml.match(/<entry>/g)||[]).length,27);
    assert.ok(xml.includes('扩展检索标记 26'));
    assert.ok(!xml.includes('草稿独有标记'));
  });
  verify('搜索结果正确展示尖括号、引号和高亮',()=>{
    const scope={window:{},document:{addEventListener(){}},console};
    require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'themes/firefly/source/js/ui/search.js'),'utf8'),scope);
    const search=scope.window.LocalSearch;
    assert.equal(search.highlight('CNN & <标签> "笔记"','标签'),'CNN &amp; &lt;<mark>标签</mark>&gt; &quot;笔记&quot;');
    assert.equal(search.highlight('<script>',''),'&lt;script&gt;');
    assert.equal(search.highlight('a+b 与 a+b','a+b'),'<mark>a+b</mark> 与 <mark>a+b</mark>');
  });
  verify('日历数据包含全部文章与正确日期',()=>{
    const data=JSON.parse(read('api/allPostMeta.json'));
    assert.equal(data.length,27);
    const p=data.find(p=>p.id==='expansion-26');
    assert.ok(p.published.startsWith('2025-09-26'));
    assert.ok(exists(p.path.replace(/^\//,'')));
  });
  verify('订阅源保留最近二十篇正式文章',()=>{
    const feed=read('atom.xml');
    assert.equal((feed.match(/<entry>/g)||[]).length,20);
    assert.ok(!feed.includes('不应发布的扩展草稿'));
  });
  verify('全站统计自动增长',()=>{
    const stats=read('index.html').match(/<div class="widget stats-widget">([\s\S]*?)<\/aside>/)[1];
    const values=[...stats.matchAll(/class="stat-value">([^<]+)/g)].map(m=>m[1]);
    assert.deepEqual(values.slice(0,3),[String(posts.length),String(categories.length),String(tags.length)]);
  });
  verify('文章没有封面时仍有默认图片',()=>assert.ok(read('index.html').includes('data-has-cover="true"')));
  verify('正文图片保留尺寸，页面不加载分类组件',()=>{
    const post=posts.findOne({slug:'dlcv-notes'});
    const html=read(post.path+'index.html');
    assert.ok(/<img[^>]+width="\d+"[^>]+height="\d+"/.test(html));
    assert.ok(!html.includes('src="/js/ui/category-folders.js'));
  });
  // Check local navigation destinations across all generated HTML routes.
  verify('全站内部导航链接都有目标文件',()=>{
    const missing=new Set();
    for(const route of hexo.route.list().filter(r=>r.endsWith('.html'))) {
      const html=read(route);
      assert.ok(html.length>100,`Empty generated page: ${route}`);
      for(const [,href] of html.matchAll(/<a\b[^>]*href="([^"#?]+)[^"]*"/g)) {
        if(!href.startsWith('/')||href.startsWith('//')) continue;
        const decoded=decodeURIComponent(href.split(/[?#]/)[0]).replace(/^\//,'');
        if(!exists(decoded||'index.html')) missing.add(decoded);
      }
    }
    assert.deepEqual([...missing],[]);
  });
  const created = await hexo.post.create({title:'模板检查',slug:'scaffold-verification'});
  verify('新建文章实际使用学习笔记模板',()=>{
    const meta=require('hexo-front-matter').parse(fs.readFileSync(created.path,'utf8'));
    assert.deepEqual(meta.categories,['学习笔记']);
    assert.deepEqual(meta.tags,[]);
    assert.equal(meta.description,'');
    assert.equal(meta.cover,'');
  });
  const report={articles:posts.length,categories:categories.length,tags:tags.length,checks,preview:path.join(work,'public')};
  if(process.argv.includes('--keep')) fs.writeFileSync(path.join(root,'..','content-expansion-preview.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  process.exitCode=checks.some(c=>!c.passed)?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  if(hexo) await hexo.exit();
  if(!process.argv.includes('--keep')) {
    // mkdtemp returned this exact directory; remove the junction before its parent.
    const modules=path.join(work,'node_modules');
    if(fs.existsSync(modules)) fs.unlinkSync(modules);
    if(path.basename(work).startsWith('time-machine-content-') && path.dirname(work)===require('node:os').tmpdir()) fs.rmSync(work,{recursive:true,force:true});
  }
});
