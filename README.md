# 庆生 H5（纯静态 · GitHub Pages）

全屏分屏的生日祝福页：入口遮罩 → 开场 → 祝福卡（屏数由 `CONFIG.messages` 决定，按句逐行淡入 + 到屏自动朗读）→ 拆礼物（蹦出一堆小物件，礼盒最后晃两下）→ 吹蜡烛 → 结尾烟花。
配色为奶油粉 / 淡紫 / 白 / 金，动效走柔和路线：花瓣雨、星光、气球、爱心、彩带、烟花。
无构建、无依赖，仓库根目录即站点根目录。

## 本地预览

```bash
python -m http.server 4173
# 或 npx serve .
```

打开 http://localhost:4173 。直接双击 `index.html` 也能看，但 `file://` 下 ES Module 与语音朗读会被浏览器限制。
按 F12 切到手机模拟（375×667 左右）看效果最接近真机；页面是移动端优先的 H5 分屏，桌面浏览器只是顺带能看。

## 改内容

文案全部集中在 `js/main.js` 顶部的 `CONFIG`：

- `name` 寿星称呼、`date` 副标题
- `messages[]` 每屏一张卡：`tag` 序号、`title` 标题、`text` 正文、`bg` 背景主题
- `gift` 拆礼物那一屏的标题、提示、拆开后的话，`gift.items` 是蹦出来的小物件（emoji 数组，随便换成 🎧🧴🪞 之类）

背景主题在 `css/style.css` 的 `.bg-blush / .bg-lavender / .bg-cream`，换成自己的图就改这三条 `url()`（路径相对 `css/` 目录，所以写 `../assets/...`；用根路径会在 Pages 项目站 404）。

## 动效清单

- 星光/花瓣：`#fx` 与 `#fxc` 两层 canvas，进入后持续飘落花瓣、上浮爱心
- 彩带：点击进入、吹蜡烛、拆礼物时喷发（`js/confetti.js`）
- 烟花：许愿屏和结尾屏自动升空炸开
- 祝福屏装饰：每屏顶部一排生日拉旗（轻轻晃）、气泡四周细闪星星，外加按屏轮换的气球 / 爱心；还没滑到的屏这些动画是 `paused` 的，省手机性能
- 祝福屏卡片移入 + 正文按句逐行淡入上移（`.line` 用 `--i` 做步进延迟）、柔光扫过、气球上浮、礼盒抖动与开盖（小物件落定后礼盒再晃两下收尾）、小物件蹦出、吹蜡烛的手指点击提示：都在 `css/style.css`
- 背景音乐由 Web Audio 现场合成（生日歌旋律），不需要音频文件；右上角「音乐」开关

## 语音

到屏自动朗读该屏文案，用系统 TTS 的中文音色（`speechSynthesis`），每张祝福卡底部有一枚「点我听这段」小按钮（整张气泡都可点），朗读时变成「朗读中 · 再点停止」，波形条跟着跳。
浏览器要求用户手势后才能出声，所以入口的「点击进入」同时也是音频解锁点（进入时会发一条静音朗读预热引擎）。

微信内置浏览器的兼容处理：
- 部分内核首次 `getVoices()` 返回空表，`voiceschanged` 之后才有音色 —— 朗读会等音色到位再补读。
- **点气泡 / 点按钮可以重听本段**（手势触发的朗读在 WKWebView 上更容易放行）；正在朗读时再点一次是停止。
- 进入 2.6s 后仍取不到中文音色，右上角显示「本机语音不可用 · 点气泡可重试」，拿到音色会自动隐藏。
- 不少安卓机型在微信里根本没有 TTS 引擎，这种情况网页无解，只能改用预生成的音频文件；要接的话在 `assets/voice/` 放每段祝福的 mp3 并改成 `<audio>` 播放。
- 背景音乐用的是 Web Audio 合成，不依赖音频文件，微信里正常。

## 部署到 GitHub Pages

```bash
git add .
git commit -m "feat: birthday h5"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

然后仓库 **Settings → Pages → Build and deployment**：

1. Source 选 **Deploy from a branch**
2. Branch 选 `main`，文件夹选 **`/ (root)`**，Save
3. 约 1 分钟后访问 `https://<用户名>.github.io/<仓库名>/`

已放 `.nojekyll` 跳过 Jekyll 处理。微信内置浏览器可能拦音频，用系统浏览器打开链接即可。
