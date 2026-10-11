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
import { FormEvent, useRef, useState } from "react";

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
      setResult(cached.data);
      requestAnimationFrame(() => {
        document.getElementById("result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
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

      requestAnimationFrame(() => {
        document.getElementById("result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
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
        <section className="result-section" id="result">
          {result && !loading && (
            <div className="result-panel">
              <p className="result-label">总结结果</p>
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
