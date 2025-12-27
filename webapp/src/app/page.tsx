"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { generateAgentReply, type TopicId } from "@/lib/friend";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const initialAssistantMessage: Message = {
  id: "init-agent",
  role: "assistant",
  content:
    "Hey bestie! I'm Atlas, your go-to brain who nerds out on sports, politics, and health. Tell me what's on your mind and I'll give you the breakdown, the context, and a plan we can actually run with.",
};

const seedFollowUps = [
  "Catch me up on the latest game or matchup you're hyped about.",
  "Need a sanity check on a headline or policy move?",
  "Want help tuning your routine so you feel better this week?",
];

const topicLabels: Record<TopicId, string> = {
  sports: "Sports",
  politics: "Politics",
  health: "Health",
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([initialAssistantMessage]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>(seedFollowUps);
  const [activeTopics, setActiveTopics] = useState<TopicId[]>([
    "sports",
    "politics",
    "health",
  ]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      setMessages((prev) => {
        const { reply, followUps: nextFollowUps, detectedTopics } =
          generateAgentReply(
            prev.map(({ role, content }) => ({ role, content })),
            trimmed,
          );

        setFollowUps(nextFollowUps);
        setActiveTopics(detectedTopics);
        setIsThinking(false);

        return [
          ...prev,
          {
            id: `${Date.now()}-assistant`,
            role: "assistant",
            content: reply,
          },
        ];
      });
    }, 350);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const statusLine = useMemo(() => {
    if (isThinking) {
      return "Atlas is thinking...";
    }

    if (messages.length > 1) {
      return "Atlas is ready when you are.";
    }

    return "Atlas is online and tuned in.";
  }, [isThinking, messages.length]);

  return (
    <div className="flex min-h-screen w-full justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
      <main className="flex w-full max-w-4xl flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
        <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Atlas — your all-in friend who knows the scoreboard, the headlines,
              and how you feel.
            </h1>
            <span className="rounded-full bg-emerald-400/10 px-4 py-1 text-sm font-medium text-emerald-300">
              {statusLine}
            </span>
          </div>
          <p className="text-sm text-slate-300">
            Toss me anything—game tape breakdowns, policy puzzles, or how to keep
            your body and brain in a good groove. I’ll map the landscape and keep
            it real.
          </p>
          <div className="flex flex-wrap gap-2">
            {activeTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80"
              >
                {topicLabels[topic]}
              </span>
            ))}
          </div>
        </header>

        <section className="flex min-h-[420px] flex-1 flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-4 shadow-inner">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-2">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`flex ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-md ${
                    message.role === "assistant"
                      ? "border-emerald-400/20 bg-slate-900/90 text-slate-100"
                      : "border-sky-500/40 bg-sky-500/20 text-sky-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </article>
            ))}
            {isThinking && (
              <article className="flex justify-start">
                <div className="max-w-[75%] rounded-2xl border border-emerald-400/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300 shadow-md">
                  typing…
                </div>
              </article>
            )}
            <div ref={bottomRef} />
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <label htmlFor="prompt" className="sr-only">
              Ask Atlas
            </label>
            <textarea
              id="prompt"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="What's the latest? Hit me with your sports, politics, or health question and we'll figure it out together."
              className="min-h-[120px] flex-1 resize-none rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/40 sm:min-h-[80px]"
            />
            <button
              type="submit"
              disabled={isThinking}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40"
            >
              {isThinking ? "Give me a sec" : "Send it"}
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {followUps.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-400/40 hover:bg-emerald-400/10"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
