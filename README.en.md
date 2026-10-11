# JianYue · Web Page Summarizer

Paste a URL to extract the main content of a web page and generate a concise Chinese summary with DeepSeek AI. Chinese and English pages are both supported; results are always shown in Chinese.

[中文文档](./README.md)

---

## 1. Tech Stack

| Category | Technology | Role |
|----------|------------|------|
| Framework | Next.js 16 (App Router) | Full-stack app: UI + API in one project |
| Language | TypeScript | Type safety |
| UI | React 19 + Ant Design 6 | Component library and zh-CN locale |
| Styling | Tailwind CSS 4 + custom CSS | Light / dark themes |
| Extraction | `@mozilla/readability` + `jsdom` | Pull readable text from HTML |
| AI | DeepSeek Chat API | Generate Chinese summaries |
| Icons | `@ant-design/icons` | Nav and button icons |
| Package manager | npm | Install deps and run scripts |

---

## 2. Project Structure

```text
web_summarizer/
├── app/                          # Next.js App Router
│   ├── api/summarize/route.ts    # Summarize API: validate → extract → AI (with cache)
│   ├── globals.css               # Global styles, theme tokens, layout, motion
│   ├── layout.tsx                # Root layout: fonts, theme boot script, header/footer
│   ├── page.tsx                  # Home: URL input, summarize UX, feature sections
│   └── favicon.ico               # Site icon (if present)
├── components/                   # Reusable UI
│   ├── AntdProvider.tsx          # Ant Design setup + light/dark theme context
│   ├── SiteHeader.tsx            # Top nav + theme toggle
│   └── SiteFooter.tsx            # Footer
├── lib/                          # Server-side logic
│   ├── extract.ts                # URL normalize, fetch page, multi-strategy extraction
│   ├── deepseek.ts               # DeepSeek chat completions wrapper
│   └── summary-cache.ts          # 10-minute in-memory cache per URL
├── public/                       # Static assets
│   ├── logo-mark.jpg             # Brand mark
│   ├── logo-wordmark.jpg         # Horizontal wordmark
│   └── hero-visual.jpg           # Hero visual
├── .env.example                  # Env template (no real secrets)
├── .env.local                    # Local secrets (do not commit)
├── .cursorrules                  # Cursor project rules
├── .gitignore                    # Git ignore rules
├── next.config.ts                # Next.js config
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript config
├── README.md                     # Chinese documentation
└── README.en.md                  # English documentation (this file)
```

### Key files

- **`app/page.tsx`**: UI and client interaction; also reuses results for the same URL within 10 minutes.
- **`app/api/summarize/route.ts`**: Backend entry; cache hits skip fetch + DeepSeek.
- **`lib/extract.ts`**: Readability first, then DOM / meta fallbacks (works for portals/homepages).
- **`lib/deepseek.ts`**: DeepSeek Chat Completions client.
- **`lib/summary-cache.ts`**: In-process cache to reduce repeat API cost.
- **`components/AntdProvider.tsx`**: ConfigProvider, theme algorithms, `jianyu-theme` in `localStorage`.
- **`components/SiteHeader.tsx`**: Logo, centered nav, light/dark toggle on the right.
- **`.env.local`**: Holds `DEEPSEEK_API_KEY`; ignored by Git.

---

## 3. Local Setup & Deploy

### Requirements

- Node.js 18+ (20+ recommended)
- npm
- A valid [DeepSeek API Key](https://platform.deepseek.com/)

### Development

```bash
# 1. Enter the project folder
cd web_summarizer

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Windows PowerShell:
Copy-Item .env.example .env.local
# macOS / Linux:
# cp .env.example .env.local

# Edit .env.local and set your key:
# DEEPSEEK_API_KEY=sk-xxxxxxxx
```

```bash
# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build (local)

```bash
npm run build
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) by default.

### Deploy on Vercel (optional)

1. Push the repo to GitHub / GitLab (make sure `.env.local` is not committed).
2. Import the repo in [Vercel](https://vercel.com/).
3. Add environment variable: `DEEPSEEK_API_KEY`.
4. Deploy and use the Vercel URL.

---

## Features (brief)

- Paste URL → extract main content → AI Chinese summary
- Chinese and English pages supported
- Light / dark theme toggle in the navbar
- Same URL within 10 minutes uses cache (no repeat DeepSeek call)

## Troubleshooting

**Cannot access page / extraction failed**  
Sites that require login, anti-bot protection, or heavy client-only rendering may fail. Try a public article page.

**AI summary failed**  
Check that `DEEPSEEK_API_KEY` in `.env.local` is valid and the account has quota; inspect the terminal logs.

---

## License

Private project. Add an open-source license if you plan to publish one.
