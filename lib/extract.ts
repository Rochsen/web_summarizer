import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

/** 正文最短字符数，过短视为提取失败 */
const MIN_CONTENT_LENGTH = 80;

/** 发给 AI 前的正文最大字符数，避免超出上下文 */
export const MAX_CONTENT_LENGTH = 12000;

export type ExtractedContent = {
  title: string;
  content: string;
  url: string;
};

/**
 * 校验并规范化用户输入的网址
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("请输入网址");
  }

  let url: URL;
  try {
    url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    throw new Error("网址格式无效，请检查后重试");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("仅支持 http 或 https 网址");
  }

  return url.toString();
}

/** 统一清理空白，保留段落可读性 */
function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** 读取 meta / Open Graph 信息 */
function getMetaContent(doc: Document, key: string): string {
  const el =
    doc.querySelector(`meta[property="${key}"]`) ||
    doc.querySelector(`meta[name="${key}"]`) ||
    doc.querySelector(`meta[itemprop="${key}"]`);
  return (el?.getAttribute("content") || "").trim();
}

/** 从页面元数据拼出补充说明（适合门户/首页） */
function extractMetaSummary(doc: Document): string {
  const parts: string[] = [];
  const description =
    getMetaContent(doc, "description") ||
    getMetaContent(doc, "og:description") ||
    getMetaContent(doc, "twitter:description");
  const keywords = getMetaContent(doc, "keywords");
  const siteName = getMetaContent(doc, "og:site_name");

  if (siteName) parts.push(`站点：${siteName}`);
  if (description) parts.push(description);
  if (keywords) parts.push(`关键词：${keywords}`);

  return normalizeText(parts.join("\n"));
}

/**
 * 通用 DOM 正文回退：去掉脚本/导航等噪声后提取可见文本
 * 兼容门户首页、列表页等 Readability 无法识别的页面
 */
function extractDomFallback(doc: Document): string {
  const clone = doc.documentElement.cloneNode(true) as typeof doc.documentElement;
  const cloneDoc = clone.ownerDocument;
  if (!cloneDoc) return "";

  const removeSelectors = [
    "script",
    "style",
    "noscript",
    "svg",
    "canvas",
    "iframe",
    "template",
    "link",
    "nav",
    "footer",
    "aside",
    "form",
    "[role='navigation']",
    "[role='banner']",
    "[role='contentinfo']",
    "[aria-hidden='true']",
  ];

  for (const selector of removeSelectors) {
    clone.querySelectorAll(selector).forEach((node) => node.remove());
  }

  const candidates = [
    "main",
    "article",
    "[role='main']",
    "#content",
    ".content",
    "#main",
    ".main",
    ".post",
    ".article",
    ".entry-content",
    ".markdown-body",
  ];

  let best = "";
  for (const selector of candidates) {
    const nodes = [...clone.querySelectorAll(selector)];
    if (nodes.length === 0) continue;
    const text = normalizeText(nodes.map((n) => n.textContent || "").join("\n\n"));
    if (text.length > best.length) best = text;
  }

  if (best.length >= MIN_CONTENT_LENGTH) {
    return best;
  }

  // 仍不够时：优先收集标题与段落，再退回整页文本
  const blocks = [
    ...clone.querySelectorAll("h1, h2, h3, h4, p, li, blockquote, td, figcaption"),
  ]
    .map((n) => normalizeText(n.textContent || ""))
    .filter((t) => t.length >= 8);

  const structured = normalizeText([...new Set(blocks)].join("\n"));
  if (structured.length >= MIN_CONTENT_LENGTH) {
    return structured;
  }

  const bodyText = normalizeText(clone.querySelector("body")?.textContent || "");
  return bodyText;
}

/** 用 Readability 尝试提取文章正文（使用独立 DOM，避免污染后续回退逻辑） */
function extractWithReadability(
  html: string,
  url: string
): { title: string; content: string } | null {
  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();
  if (!article) return null;

  const content = normalizeText(article.textContent || "");
  if (content.length < MIN_CONTENT_LENGTH) return null;

  return {
    title: normalizeText(article.title || "") || "未命名页面",
    content,
  };
}

/**
 * 多策略提取正文：
 * 1) Readability（适合文章页）
 * 2) DOM 通用回退（适合门户/列表/首页）
 * 3) 元数据补充（description 等）
 */
function extractFromHtml(html: string, url: string): ExtractedContent {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  const pageTitle =
    normalizeText(
      getMetaContent(doc, "og:title") ||
        getMetaContent(doc, "twitter:title") ||
        doc.title ||
        ""
    ) || "未命名页面";

  const readability = extractWithReadability(html, url);
  const metaSummary = extractMetaSummary(doc);
  const domFallback = extractDomFallback(doc);

  let title = readability?.title || pageTitle;
  let content = "";

  if (readability && readability.content.length >= MIN_CONTENT_LENGTH) {
    content = readability.content;
  } else if (domFallback.length >= MIN_CONTENT_LENGTH) {
    // 门户类页面：把站点描述放在前面，帮助 AI 理解页面定位
    content = metaSummary
      ? normalizeText(`${metaSummary}\n\n${domFallback}`)
      : domFallback;
  } else if (metaSummary.length >= MIN_CONTENT_LENGTH) {
    content = metaSummary;
  }

  if (content.length < MIN_CONTENT_LENGTH) {
    throw new Error("未能提取到有效正文，请换一篇文章页试试");
  }

  const truncated =
    content.length > MAX_CONTENT_LENGTH
      ? content.slice(0, MAX_CONTENT_LENGTH)
      : content;

  return {
    title,
    content: truncated,
    url,
  };
}

/**
 * 抓取网页 HTML 并提取正文
 */
export async function extractWebContent(url: string): Promise<ExtractedContent> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let html: string;
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`网页抓取失败（HTTP ${response.status}）`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (
      contentType &&
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml")
    ) {
      throw new Error("该链接不是可阅读的网页内容");
    }

    html = await response.text();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("网页抓取超时，请稍后重试");
      }
      if (
        error.message.startsWith("网页抓取失败") ||
        error.message.startsWith("该链接不是")
      ) {
        throw error;
      }
      console.error(
        "网页抓取异常:",
        error.message,
        (error as Error & { cause?: unknown }).cause
      );
    }
    throw new Error("无法访问该网页，请确认网址是否正确或是否可公开访问");
  } finally {
    clearTimeout(timeout);
  }

  return extractFromHtml(html, url);
}
