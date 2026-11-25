"use client";

import { useEffect, useState } from "react";
import { can } from "@/lib/rbac";
import { useToast } from "@/components/admin/ToastProvider";
import styles from "./AiChatAssistant.module.css";

type ChatMessage = { id: string; role: "USER" | "ASSISTANT"; content: string };
type ChatThread = { id: string; title: string };

export default function AiChatAssistant({ permissions }: { permissions: string[] }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const allowed = can({ user: { permissions } }, "ai.view");

  useEffect(() => {
    if (!open || !allowed) return;
    fetch("/api/admin/ai/chat/threads")
      .then((res) => (res.ok ? res.json() : []))
      .then(setThreads)
      .catch(() => {});
  }, [open, allowed]);

  async function loadThread(id: string) {
    const res = await fetch(`/api/admin/ai/chat/${id}`);
    if (!res.ok) return;
    const thread = await res.json();
    setThreadId(thread.id);
    setMessages(thread.messages ?? []);
  }

  function startNewChat() {
    setThreadId(null);
    setMessages([]);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: "USER", content: text }]);
    setSending(true);
    try {
      const res = await fetch("/api/admin/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, message: text }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Chat request failed");
      }
      const data = await res.json();
      setThreadId(data.thread.id);
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Chat request failed", "error");
    } finally {
      setSending(false);
    }
  }

  if (!allowed) return null;

  return (
    <>
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <select
              aria-label="Chat thread"
              value={threadId ?? ""}
              onChange={(e) => (e.target.value ? loadThread(e.target.value) : startNewChat())}
            >
              <option value="">New chat</option>
              {threads.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
            <div className={styles.headerActions}>
              <button type="button" onClick={startNewChat} aria-label="New chat">
                +
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
                ✕
              </button>
            </div>
          </div>
          <div className={styles.messages}>
            {messages.length === 0 && <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>Ask me about your leads, students, or courses.</p>}
            {messages.map((m) => (
              <div key={m.id} className={`${styles.bubble} ${m.role === "USER" ? styles.user : styles.assistant}`}>
                {m.content}
              </div>
            ))}
          </div>
          <div className={styles.inputRow}>
            <input
              aria-label="Chat message"
              style={{ flex: 1 }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask the AI assistant…"
            />
            <button type="button" onClick={send} disabled={sending || !input.trim()}>
              {sending ? "…" : "Send"}
            </button>
          </div>
        </div>
      )}
      <button type="button" className={styles.launcher} onClick={() => setOpen((v) => !v)} aria-label="AI chat assistant">
        {open ? "✕" : "AI"}
      </button>
    </>
  );
}
