"use client";
import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Send,
  Check,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import { invalidateDocuments } from "../../lib/homebridge/workflow";
import {
  Home,
  BuyerProfile,
  AssistantResult,
  ChatMessage,
} from "../../lib/homebridge/schema";
import { defaultAssumptions } from "../../lib/homebridge/finance";
import { useWorkspace, postJson } from "./workspace-provider";
const starters = [
  "Is this home a good fit for me?",
  "Can I comfortably afford it?",
  "What should I be concerned about?",
  "Is the asking price reasonable?",
  "What should I ask before buying?",
  "Help me prepare an offer.",
];
export default function Advisor({ home }: { home: Home }) {
  const { state, update, config, profileFor, notify } = useWorkspace();
  const profile = profileFor(home.id);
  const messages = state.conversations[home.id] || [];
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [answer, setAnswer] = useState("");
  const history = useRef<HTMLDivElement>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  const liveAllowed =
    config.ai && Boolean(config.user) && state.aiConsent.includes(home.id);
  const discovery =
    profile.monthlyBudget === null
      ? {
          key: "monthlyBudget",
          label: "What is your comfortable monthly housing budget?",
          kind: "number",
          options: [],
        }
      : profile.firstHome === "Not shared"
        ? {
            key: "firstHome",
            label: "Is this your first home?",
            kind: "select",
            options: ["Yes", "No"],
          }
        : profile.yard === "Not shared"
          ? {
              key: "yard",
              label: "How important is having a yard?",
              kind: "select",
              options: ["Important", "Nice to have", "Not needed"],
            }
          : profile.preapproved === "Not shared"
            ? {
                key: "preapproved",
                label: "Are you preapproved for a mortgage?",
                kind: "select",
                options: ["Yes", "No", "In progress"],
              }
            : null;
  useEffect(() => {
    history.current?.scrollTo({
      top: history.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, busy]);
  function patchProfile(patch: Partial<BuyerProfile>) {
    update((s) => {
      const next = { ...profile, ...patch };
      return {
        ...s,
        offers: invalidateDocuments(
          s,
          next.remember ? Object.keys(s.offers) : [home.id],
        ),
        profile: next.remember ? next : { ...s.profile, remember: false },
        propertyProfiles: { ...s.propertyProfiles, [home.id]: next },
      };
    });
  }
  async function ask(question: string) {
    if (!question.trim() || busy) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError("");
    setNotice("");
    const message: ChatMessage = {
      role: "user",
      text: question.trim().slice(0, 2000),
    };
    const input = [...messages, message].slice(-16);
    update((s) => ({
      ...s,
      conversations: {
        ...s.conversations,
        [home.id]: [...(s.conversations[home.id] || []), message].slice(-180),
      },
    }));
    setText("");
    try {
      const response = await postJson(
        "/api/assistant",
        {
          property: home,
          profile: { ...profile, name: "" },
          assumptions: state.assumptions[home.id] || defaultAssumptions(home),
          messages: input,
          useLive: liveAllowed,
        },
        controller.signal,
      );
      const result: AssistantResult = await response.json();
      if (controller.signal.aborted) return;
      update((s) => ({
        ...s,
        conversations: {
          ...s.conversations,
          [home.id]: [
            ...(s.conversations[home.id] || []),
            {
              role: "assistant" as const,
              text:
                result.answer +
                (result.followUp ? "\n\n" + result.followUp : ""),
              mode: result.mode,
            },
          ].slice(-180),
        },
      }));
      setNotice(result.notice || "");
    } catch (e) {
      if (controller.signal.aborted) return;
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="hb-advisor" id="property-advisor">
      <div className="hb-advisor-heading">
        <span className="hb-ai-symbol">
          <Sparkles size={21} />
        </span>
        <div>
          <h2>Homebridge AI</h2>
          <span>
            {liveAllowed
              ? "Live AI · OpenAI on request"
              : "Scripted demo guide · no model connected to this chat"}
          </span>
        </div>
      </div>
      <div className="hb-advisor-context">
        <span className="hb-green-dot" /> Focused on {home.address}
      </div>
      <div className="hb-chat-history" ref={history} aria-live="polite">
        <div className="hb-chat-bubble assistant">
          <strong>Let’s understand this home.</strong>
          <p>
            Hi! I can help you figure out whether this home is right for you.
            Want to start with affordability, potential concerns, or how it
            compares to other homes?
          </p>
        </div>
        {messages.map((m, i) => (
          <div key={i} className={`hb-chat-bubble ${m.role}`}>
            <small>
              {m.role === "user"
                ? "You"
                : m.mode === "live"
                  ? "Homebridge AI · live"
                  : "Homebridge guide · scripted demo"}
            </small>
            <p>{m.text}</p>
          </div>
        ))}
        {busy && (
          <div className="hb-chat-loading">
            <LoaderCircle size={16} className="hb-spin" /> Reviewing the
            supplied details…
          </div>
        )}
      </div>
      <form
        className="hb-chat-composer"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(text);
        }}
      >
        <textarea
          aria-label="Ask about this home"
          placeholder="Ask about this home…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void ask(text);
            }
          }}
        />
        <button aria-label="Send question" disabled={busy || !text.trim()}>
          <Send size={18} />
        </button>
      </form>
      {discovery && (
        <form
          className="hb-discovery"
          onSubmit={(e) => {
            e.preventDefault();
            if (answer === "") return;
            const value = discovery.kind === "number" ? Number(answer) : answer;
            if (
              discovery.kind === "number" &&
              (!Number.isFinite(value) ||
                Number(value) <= 0 ||
                Number(value) > 100000)
            ) {
              notify("Enter a monthly comfort budget between $1 and $100,000.");
              return;
            }
            patchProfile({ [discovery.key]: value });
            setAnswer("");
            notify("Preference saved for this home.");
          }}
        >
          <span className="hb-eyebrow">
            ONE QUESTION TO PERSONALIZE YOUR ANALYSIS
          </span>
          <label>
            {discovery.label}
            {discovery.kind === "number" ? (
              <input
                aria-label="Comfortable monthly housing budget"
                type="number"
                min="1"
                max="100000"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="For example, 2800"
              />
            ) : (
              <select
                aria-label={discovery.label}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              >
                <option value="">Choose an answer</option>
                {discovery.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            )}
          </label>
          <div className="hb-row">
            <button className="hb-btn hb-small hb-primary">
              Save answer <Check size={14} />
            </button>
            <Link
              href={`/homes/${home.id}?tab=profile`}
              className="hb-text-link"
            >
              Edit preferences
            </Link>
          </div>
        </form>
      )}
      <div className="hb-starter-prompts">
        {starters.map((prompt) => (
          <button key={prompt} disabled={busy} onClick={() => void ask(prompt)}>
            {prompt}
            <ArrowUpRight size={12} />
          </button>
        ))}
      </div>
      {error && (
        <div className="hb-error" role="alert">
          {error}
          <button
            className="hb-text-link"
            onClick={() => {
              const last = messages.findLast((m) => m.role === "user");
              if (last) setText(last.text);
            }}
          >
            Put question back in editor
          </button>
        </div>
      )}
      {notice && <p className="hb-service-note">{notice}</p>}

      <details className="hb-details hb-chat-privacy">
        <summary>Data, privacy & response mode</summary>
        <p>
          Demo answers use local rules on the server. Live AI requires
          configured OpenAI, sign-in, and working daily spending controls. No
          private documents are sent. Only this property’s supplied facts,
          preferences, assumptions, and recent conversation are shared when you
          send a question.
        </p>
        {config.ai && config.user && (
          <label className="hb-checkbox">
            <input
              type="checkbox"
              checked={state.aiConsent.includes(home.id)}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  aiConsent: e.target.checked
                    ? [...s.aiConsent, home.id]
                    : s.aiConsent.filter((id) => id !== home.id),
                }))
              }
            />
            Allow OpenAI to process this home’s context when I send a question.
          </label>
        )}
        <p>
          All guidance is informational. Property data and material decisions
          require professional verification.
        </p>
      </details>
    </section>
  );
}
