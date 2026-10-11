"use client";

import { FormEvent, useState } from "react";

type SummarizeResult = {
  title: string;
  summary: string;
  url: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SummarizeResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("请输入网址");
      return;
    }

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

      setResult({
        title: data.title,
        summary: data.summary,
        url: data.url,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "总结失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell relative flex flex-1 flex-col">
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            网页总结
          </h1>
          <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
            粘贴网址，一键生成简洁中文概要
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="url" className="sr-only">
            网页地址
          </label>
          <input
            id="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-base text-[var(--foreground)] outline-none backdrop-blur-sm transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3.5 text-base font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>正在总结…</span>
              </>
            ) : (
              "开始总结"
            )}
          </button>
        </form>

        {loading && (
          <p className="loading-hint mt-6 text-center text-sm text-[var(--muted)]">
            正在提取网页内容并用 AI 生成概要，请稍候…
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="result-panel mt-8 rounded-xl border border-red-200 bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]"
          >
            {error}
          </div>
        )}

        {result && !loading && (
          <section className="result-panel mt-10">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
              总结结果
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-[var(--foreground)]">
              {result.title}
            </h2>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block truncate text-sm text-[var(--muted)] underline-offset-2 hover:text-[var(--accent)] hover:underline"
            >
              {result.url}
            </a>
            <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-[var(--foreground)]">
              {result.summary}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
