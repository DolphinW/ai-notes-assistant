import { NextResponse } from "next/server";
import { createSDK } from "dashscope-node";

type SummarizeRequestBody = {
  text?: string;
};

const SYSTEM_PROMPT =
  "你是一个读书助手，请用中文清晰列出以下内容的3个核心观点，每点不超过30字，不要解释，直接列点：";

function extractSummary(result: unknown): string {
  const data = result as
    | {
        data?: { output?: { text?: string } };
        output?: {
          text?: string;
          choices?: Array<{
            message?: { content?: string };
          }>;
        };
      }
    | undefined;

  const textSummary = data?.data?.output?.text ?? data?.output?.text;
  const messageSummary = data?.output?.choices?.[0]?.message?.content;
  const summary = textSummary ?? messageSummary;
  return typeof summary === "string" ? summary.trim() : "";
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "服务端未配置 DASHSCOPE_API_KEY" },
        { status: 500 },
      );
    }

    let body: SummarizeRequestBody;
    try {
      body = (await req.json()) as SummarizeRequestBody;
    } catch {
      return NextResponse.json(
        { error: "请求体必须为 JSON 格式" },
        { status: 400 },
      );
    }

    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json(
        { error: "参数 text 不能为空字符串" },
        { status: 400 },
      );
    }

    const dashscope = createSDK({ accessToken: apiKey });
    const result = await dashscope.chat.completion.request({
      model: "qwen-max",
      input: {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
      },
      parameters: {
        result_format: "text",
      },
    });

    const summary = extractSummary(result);
    if (!summary) {
      return NextResponse.json(
        { error: "模型返回内容为空" },
        { status: 502 },
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json(
      { error: `总结失败: ${message}` },
      { status: 500 },
    );
  }
}
