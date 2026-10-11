/**
 * 调用 DeepSeek 对正文生成中文摘要
 */
export async function summarizeWithDeepSeek(
  title: string,
  content: string
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("未配置 DeepSeek API Key，请检查环境变量");
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "你是一个专业的网页内容总结助手。无论原文是中文还是英文，你都必须用简洁流畅的中文输出概要。不要输出英文标题或英文正文。概要应覆盖核心观点与关键信息，控制在 200～400 字，使用自然段落，不要使用 markdown 标题符号。",
        },
        {
          role: "user",
          content: `请总结以下网页内容。\n\n标题：${title}\n\n正文：\n${content}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("DeepSeek API error:", response.status, detail);
    throw new Error("AI 总结失败，请稍后重试");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const summary = data.choices?.[0]?.message?.content?.trim();
  if (!summary) {
    throw new Error("AI 未返回有效总结内容");
  }

  return summary;
}
