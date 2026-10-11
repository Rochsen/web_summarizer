"use client";

import {
  Alert,
  Button,
  Input,
  Space,
  Spin,
  Typography,
} from "antd";
import { ArrowRightOutlined, LinkOutlined } from "@ant-design/icons";
import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";

type SummarizeResult = {
  title: string;
  summary: string;
  url: string;
};

/** 前端同网址缓存有效期：10 分钟 */
const CLIENT_CACHE_TTL_MS = 10 * 60 * 1000;

const features = [
  {
    title: "智能提取",
    desc: "自动抓取网页正文，过滤导航与广告噪声，兼容文章页与门户首页。",
  },
  {
    title: "中文概要",
    desc: "无论原文是中文还是英文，都由 AI 输出简洁流畅的中文总结。",
  },
  {
    title: "即开即用",
    desc: "无需注册，粘贴网址即可开始，适合快速阅读与信息筛选。",
  },
];

const guides = [
  {
    title: "粘贴网址",
    desc: "在输入框中填入想要阅读的网页链接。",
  },
  {
    title: "开始总结",
    desc: "点击按钮后，系统会提取正文并调用 AI 生成概要。",
  },
  {
    title: "阅读结果",
    desc: "在结果区查看标题与中文摘要，也可跳转原页面核对。",
  },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SummarizeResult | null>(null);
  // 记录最近一次成功总结，用于同网址 10 分钟内复用
  const cacheRef = useRef<{
    inputUrl: string;
    data: SummarizeResult;
    expiresAt: number;
  } | null>(null);
  // 标记本次提交需要滚到结果区（等 DOM 渲染后再滚）
  const shouldScrollRef = useRef(false);

  /** 导航下方目标空隙（px） */
  const RESULT_GAP = 56;

  function getHeaderHeight() {
    const header = document.querySelector(".site-header");
    return header instanceof HTMLElement
      ? header.getBoundingClientRect().height
      : 72;
  }

  /** 按导航栏实际高度计算偏移，避免 sticky 顶栏盖住「总结结果」 */
  function scrollToResult() {
    const el = document.getElementById("result");
    if (!el) return;

    const offset = getHeaderHeight() + RESULT_GAP;
    const top =
      window.scrollY + el.getBoundingClientRect().top - offset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });

    // 平滑滚动结束后再校正一次，避免动画过程中布局变化导致仍被挡住
    window.setTimeout(() => {
      const target = document.getElementById("result");
      if (!target) return;
      const desiredTop = getHeaderHeight() + RESULT_GAP;
      const delta = target.getBoundingClientRect().top - desiredTop;
      if (Math.abs(delta) > 4) {
        window.scrollBy({ top: delta, behavior: "auto" });
      }
    }, 450);
  }

  /** 等结果标题节点挂载后再滚动（可重试几次） */
  function scheduleScrollToResult() {
    shouldScrollRef.current = true;
    let tries = 0;
    const tick = () => {
      tries += 1;
      // #result 仅在 loading 结束且有结果时才会挂载
      const el = document.getElementById("result");
      if (el && shouldScrollRef.current) {
        shouldScrollRef.current = false;
        scrollToResult();
        return;
      }
      if (tries < 40) {
        window.setTimeout(tick, 50);
      }
    };
    window.setTimeout(tick, 80);
  }

  // 结果渲染完成后再滚动（兜底）
  useEffect(() => {
    if (!result || loading || !shouldScrollRef.current) return;
    const timer = window.setTimeout(() => {
      if (!shouldScrollRef.current) return;
      shouldScrollRef.current = false;
      scrollToResult();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [result, loading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmed = url.trim();
    if (!trimmed) {
      setError("请输入网址");
      return;
    }

    // 输入框网址未变且在 10 分钟内：直接复用结果，不请求后端 / DeepSeek
    const cached = cacheRef.current;
    if (
      cached &&
      cached.inputUrl === trimmed &&
      Date.now() < cached.expiresAt
    ) {
      setResult({ ...cached.data });
      scheduleScrollToResult();
      return;
    }

    setResult(null);
    setLoading(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = (await response.json()) as SummarizeResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "总结失败，请稍后重试");
      }

      const nextResult = {
        title: data.title,
        summary: data.summary,
        url: data.url,
      };
      setResult(nextResult);
      cacheRef.current = {
        inputUrl: trimmed,
        data: nextResult,
        expiresAt: Date.now() + CLIENT_CACHE_TTL_MS,
      };
      scheduleScrollToResult();
    } catch (err) {
      setError(err instanceof Error ? err.message : "总结失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="hero" id="top">
        <div className="hero__bg" aria-hidden="true">
          <Image
            src="/hero-visual.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="hero__veil" />
        </div>

        <div className="hero__content">
          <div className="hero__brand-row">
            <Image
              src="/logo-mark.jpg"
              alt=""
              width={48}
              height={48}
              className="site-brand__mark"
              priority
            />
            <span className="hero__brand-text">简阅</span>
          </div>

          <h1 className="hero__title">一键读懂长网页</h1>
          <p className="hero__desc">
            粘贴链接，智能提取正文并生成简洁中文概要，让阅读更轻一点。
          </p>

          <form
            id="summarize"
            className="hero__form"
            onSubmit={handleSubmit}
          >
            <div className="hero__form-row">
              <Input
                size="large"
                allowClear
                prefix={<LinkOutlined style={{ color: "#8c8c8c" }} />}
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                aria-label="网页地址"
              />
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={!loading ? <ArrowRightOutlined /> : undefined}
                iconPlacement="end"
              >
                {loading ? "正在总结" : "开始总结"}
              </Button>
            </div>
            <p className="hero__hint">支持中英文网页，结果统一以中文呈现</p>
          </form>

          {loading && (
            <Space style={{ marginTop: 28 }}>
              <Spin size="small" />
              <Typography.Text type="secondary">
                正在提取网页内容并用 AI 生成概要…
              </Typography.Text>
            </Space>
          )}

          {error && (
            <Alert
              style={{ marginTop: 24, maxWidth: 640, marginInline: "auto" }}
              type="error"
              showIcon
              message={error}
            />
          )}
        </div>
      </section>

      {(result || loading) && (
        <section className="result-section">
          {result && !loading && (
            <div className="result-panel">
              {/* 锚点打在标题文字上，滚动时按导航高度留白 */}
              <p id="result" className="result-label">
                总结结果
              </p>
              <h2 className="result-title">{result.title}</h2>
              <a
                className="result-link"
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {result.url}
              </a>
              <p className="result-summary">{result.summary}</p>
            </div>
          )}
        </section>
      )}

      <section className="section--muted" id="feature">
        <div className="section__inner">
          <h2 className="section__title">为快速阅读而生</h2>
          <p className="section__desc">
            用更干净的信息密度，帮你在短时间内抓住网页重点。
          </p>
          <div className="feature-grid">
            {features.map((item) => (
              <article key={item.title} className="feature-item">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="guide">
        <h2 className="section__title">三步完成总结</h2>
        <p className="section__desc">流程足够简单，打开就能用。</p>
        <ol className="guide-list">
          {guides.map((item, index) => (
            <li key={item.title}>
              <span className="guide-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
