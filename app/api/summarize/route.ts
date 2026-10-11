import { NextRequest, NextResponse } from "next/server";
import { summarizeWithDeepSeek } from "@/lib/deepseek";
import { extractWebContent, normalizeUrl } from "@/lib/extract";

/**
 * POST /api/summarize
 * 入参：{ url: string }
 * 出参：{ title, summary, url }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url !== "string") {
      return NextResponse.json({ error: "请提供有效的网址" }, { status: 400 });
    }

    const url = normalizeUrl(body.url);
    const extracted = await extractWebContent(url);
    const summary = await summarizeWithDeepSeek(
      extracted.title,
      extracted.content
    );

    return NextResponse.json({
      title: extracted.title,
      summary,
      url: extracted.url,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "总结失败，请稍后重试";

    const status =
      message.includes("请输入") ||
      message.includes("无效") ||
      message.includes("仅支持")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
