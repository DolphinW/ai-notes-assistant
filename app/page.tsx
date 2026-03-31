"use client";

import { useState } from "react";

type SummarizeResponse = {
  summary?: string;
  error?: string;
};

export default function Home() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setSummary("");

    if (!text.trim()) {
      setError("请输入需要总结的内容");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = (await res.json()) as SummarizeResponse;
      if (!res.ok) {
        setError(data.error ?? "请求失败");
        return;
      }

      setSummary(data.summary ?? "");
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="mx-auto w-full max-w-[600px]">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          AI 读书笔记生成器
        </h1>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="粘贴书摘或文章..."
            className="h-40 w-full resize-none rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? "生成中..." : "生成读书笔记"}
          </button>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>

        {summary ? (
          <section className="mt-6 rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">总结结果</h2>
            <pre className="whitespace-pre-wrap text-sm leading-7 text-gray-800">
              {summary}
            </pre>
          </section>
        ) : null}
      </div>
    </main>
  );
}
