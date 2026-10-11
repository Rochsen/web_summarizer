# 简阅 · 网页总结工具

输入网址，自动提取网页正文，并用 DeepSeek AI 生成简洁中文概要。支持中英文网页，结果统一以中文展示。

[English](./README.en.md)

---

## 1. 项目技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 16（App Router） | 前后端一体，页面与 API 同仓 |
| 语言 | TypeScript | 类型安全 |
| UI | React 19 + Ant Design 6 | 组件库与中文语言包 |
| 样式 | Tailwind CSS 4 + 自定义 CSS | 浅色 / 深色主题 |
| 正文提取 | `@mozilla/readability` + `jsdom` | 从 HTML 抽取可读正文 |
| AI | DeepSeek Chat API | 生成中文摘要 |
| 图标 | `@ant-design/icons` | 导航与按钮图标 |
| 包管理 | npm | 依赖安装与脚本 |

---

## 2. 项目结构

```text
web_summarizer/
├── app/                          # Next.js App Router 应用目录
│   ├── api/summarize/route.ts    # 总结接口：校验 URL → 提取 → AI 总结（含缓存）
│   ├── globals.css               # 全局样式、主题变量、布局与动效
│   ├── layout.tsx                # 根布局：字体、主题脚本、页头页脚
│   ├── page.tsx                  # 首页：输入框、总结交互、功能介绍
│   └── favicon.ico               # 站点图标（若存在）
├── components/                   # 可复用 UI 组件
│   ├── AntdProvider.tsx          # Ant Design 配置、深浅色主题 Context
│   ├── SiteHeader.tsx            # 顶部导航 + 主题切换按钮
│   └── SiteFooter.tsx            # 页脚
├── lib/                          # 服务端业务逻辑
│   ├── extract.ts                # URL 规范化、抓取网页、多策略提取正文
│   ├── deepseek.ts               # 调用 DeepSeek 生成中文摘要
│   └── summary-cache.ts          # 同网址 10 分钟内存缓存，避免重复计费
├── public/                       # 静态资源
│   ├── logo-mark.jpg             # 品牌图标
│   ├── logo-wordmark.jpg         # 品牌横版标识
│   └── hero-visual.jpg           # 首页 Hero 视觉图
├── .env.example                  # 环境变量示例（不含真实 Key）
├── .env.local                    # 本地密钥（勿提交 Git）
├── .cursorrules                  # Cursor 项目规则
├── .gitignore                    # Git 忽略配置
├── next.config.ts                # Next.js 配置
├── package.json                  # 依赖与脚本
├── tsconfig.json                 # TypeScript 配置
├── README.md                     # 中文说明（本文件）
└── README.en.md                  # English documentation
```

### 关键文件说明

- **`app/page.tsx`**：用户界面与交互；前端也会做同网址 10 分钟结果复用。
- **`app/api/summarize/route.ts`**：后端入口；命中缓存则跳过抓取与 DeepSeek。
- **`lib/extract.ts`**：先用 Readability，失败则回退 DOM / 元数据提取（兼容门户首页）。
- **`lib/deepseek.ts`**：封装 DeepSeek Chat Completions 请求。
- **`lib/summary-cache.ts`**：进程内缓存，降低重复总结费用。
- **`components/AntdProvider.tsx`**：ConfigProvider、主题算法、`jianyu-theme` 本地存储。
- **`components/SiteHeader.tsx`**：Logo、居中导航、右侧深/浅色切换。
- **`.env.local`**：放置 `DEEPSEEK_API_KEY`，已被 `.gitignore` 忽略。

---

## 3. 个人如何部署和启动

### 环境要求

- Node.js 18+（建议 20+）
- npm
- 可用的 [DeepSeek API Key](https://platform.deepseek.com/)

### 本地开发

```bash
# 1. 进入项目目录
cd web_summarizer

# 2. 安装依赖
npm install

# 3. 配置环境变量
# Windows PowerShell:
Copy-Item .env.example .env.local
# macOS / Linux:
# cp .env.example .env.local

# 编辑 .env.local，填入真实 Key：
# DEEPSEEK_API_KEY=sk-xxxxxxxx
```

```bash
# 4. 启动开发服务
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

### 生产构建（本机）

```bash
npm run build
npm run start
```

默认仍访问 [http://localhost:3000](http://localhost:3000)。

### 部署到 Vercel（可选）

1. 将代码推送到 GitHub / GitLab 等仓库（确认未提交 `.env.local`）。
2. 在 [Vercel](https://vercel.com/) 导入该仓库。
3. 在项目 Environment Variables 中添加：`DEEPSEEK_API_KEY`。
4. 部署完成后使用 Vercel 提供的域名访问。

---

## 功能说明（简要）

- 粘贴网址 → 提取正文 → AI 中文概要
- 支持中英文网页
- 导航栏深 / 浅色切换
- 相同网址 10 分钟内重复总结走缓存，不重复调用 DeepSeek

## 常见问题

**无法访问网页 / 提取失败**  
部分站点需登录、反爬或纯前端渲染，可能抓不到正文。可换公开文章页再试。

**AI 总结失败**  
检查 `.env.local` 中 Key 是否有效、账户是否有余额，并查看终端报错日志。

---

## License

Private project. 请按自身需要补充开源协议。
