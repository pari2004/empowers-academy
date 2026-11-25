"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { contactBar as contactBarFallback } from "@/lib/content";
import { emit, on } from "@/lib/events";
import { Icon } from "./Icons";

type Msg = { from: "bot" | "user"; text: string };

const initial: Msg[] = [
  {
    from: "bot",
    text: "Hi! I can help you find the right AI program or connect you with an advisor.",
  },
];

export default function ChatWidget({ phone, whatsapp }: { phone?: string; whatsapp?: string } = {}) {
  const resolvedPhone = phone || contactBarFallback.phone;
  const resolvedWhatsapp = whatsapp || contactBarFallback.whatsapp;

  const quickReplies = [
    { label: "Talk to an Advisor", reply: "I'd like to talk to an advisor.", action: () => emit("open-lead") },
    {
      label: "Chat on WhatsApp",
      reply: "Can I chat with you on WhatsApp?",
      action: () => window.open(`https://wa.me/${resolvedWhatsapp}`, "_blank", "noopener,noreferrer"),
    },
    { label: "Download Brochure", reply: "Can I get the brochure?", action: () => emit("open-brochure") },
    {
      label: "Which program fits me?",
      reply: "Which program fits me?",
      action: () => emit("open-quiz"),
    },
  ];

  const botFollowUp: Record<string, string> = {
    "Talk to an Advisor":
      `Great! Opening the contact form for you now so an advisor can reach out. You can also call ${resolvedPhone}.`,
    "Chat on WhatsApp": "Opening WhatsApp for you now, our team usually replies within a few minutes.",
    "Download Brochure": "Opening the brochure form for you now, just add your name and email.",
    "Which program fits me?":
      "Opening a quick 3-question quiz now so we can point you to the right track.",
  };

  const [open, setOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(true);
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const off1 = on("open-chat", () => setOpen(true));
    const off2 = on("close-chat", () => setOpen(false));
    return () => {
      off1();
      off2();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  const handleOpenChat = () => {
    setOpen(true);
    setShowTeaser(false);
  };

  const send = (q: (typeof quickReplies)[number]) => {
    setMsgs((m) => [...m, { from: "user", text: q.reply }]);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", text: botFollowUp[q.label] }]);
      q.action();
    }, 450);
  };

  return (
    <>
      <div className={`chat-fab-wrapper ${open ? "hide" : ""}`}>
        {showTeaser && (
          <div className="chat-teaser-bubble" onClick={handleOpenChat}>
            <div className="chat-teaser-content">
              <strong>Ask Echo</strong>
              <small>Your AI Chat Assistant</small>
            </div>
            <button
              className="chat-teaser-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowTeaser(false);
              }}
              aria-label="Close teaser"
            >
              ×
            </button>
          </div>
        )}
        <button
          className="chat-fab"
          onClick={handleOpenChat}
          aria-label="Ask Echo - Your AI Chat Assistant"
        >
          <span className="chat-fab-glow" />
          <span className="chat-avatar-wrapper">
            <Image
              src="/bot_avatar_trans.png"
              alt="Ask Echo - Your AI Chat Assistant"
              width={100}
              height={100}
              className="chat-fab-bot-img"
              priority
            />
          </span>
          <span className="chat-online-badge" title="Online" />
        </button>
      </div>

      <div className={`chat-panel glass-panel ${open ? "show" : ""}`} role="dialog" aria-label="Ask Echo - Your AI Chat Assistant">
        <div className="chat-head">
          <div className="chat-head-brand">
            <span className="chat-orb" aria-hidden="true">
              <Image src="/bot_avatar_trans.png" alt="Echo AI Assistant" width={80} height={80} priority />
            </span>
            <div>
              <strong>Ask Echo</strong>
              <em><span className="chat-status-dot" /> Your AI Chat Assistant</em>
            </div>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="chat-list" ref={listRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`chat-msg ${m.from}`}>
              {m.from === "bot" && (
                <span className="chat-avatar" aria-hidden="true">
                  <Image src="/bot_avatar_trans.png" alt="Echo Bot" width={40} height={40} />
                </span>
              )}
              <p>{m.text}</p>
            </div>
          ))}
        </div>

        <div className="chat-quick">
          {quickReplies.map((q) => (
            <button key={q.label} className="chat-chip" onClick={() => send(q)}>
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
