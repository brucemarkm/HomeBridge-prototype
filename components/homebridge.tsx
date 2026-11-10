"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createLocalRepository,
  localAssistantProvider,
  demoPropertyProvider,
} from "../lib/providers";
import Homepage from "./homepage";
import PropertyCard from "./property-card";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Heart,
  SlidersHorizontal,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Check,
  Plus,
  X,
  Menu,
  Sparkles,
  ArrowLeft,
  LayoutDashboard,
  Home,
  GitCompareArrows,
  MessageCircle,
  Files,
  Wallet,
  Settings,
  ChevronRight,
  Bell,
  ShieldCheck,
  House,
  PanelLeft,
  CheckCircle2,
  Send,
  Upload,
  CalendarDays,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  Property,
  State,
  Transaction,
  properties,
  initialState,
  money,
  mortgage,
  stages,
  cities,
  parseSearch,
  demoAnswer,
  photo,
} from "../lib/model";

const disclosure =
  "Homebridge is currently a demonstration platform. Property information, agents, transactions, and services shown may be simulated. No brokerage representation or professional relationship is established through this demo.";
const buyerNav = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Explore homes", "/homes", Search],
  ["Saved homes", "/dashboard/saved", Heart],
  ["Compare", "/dashboard/compare", GitCompareArrows],
  ["Homebridge AI", "/dashboard/assistant", Sparkles],
  ["My purchase", "/dashboard/purchase", Home],
  ["Documents", "/dashboard/documents", Files],
  ["Messages", "/dashboard/messages", MessageCircle],
  ["Financial tools", "/dashboard/finances", Wallet],
  ["Account settings", "/dashboard/settings", Settings],
] as const;
export default function Homebridge() {
  const path = usePathname() || "/";
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState("");
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState(params.get("q") || "");
  const [filters, setFilters] = useState({
    city: params.get("city") || "",
    max: Number(params.get("max")) || 0,
    beds: Number(params.get("beds")) || 0,
    baths: 0,
    type: "",
    sqft: 0,
    year: 0,
    lot: 0,
    garage: 0,
    status: "",
  });
  const [advanced, setAdvanced] = useState(false);
  const [sort, setSort] = useState("Recommended");
  const [view, setView] = useState("list");
  const [chat, setChat] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(0);
  const [gallery, setGallery] = useState(0);
  const [calc, setCalc] = useState({
    price: Number(params.get("price")) || 500000,
    down: 20,
    rate: 6.5,
    years: 30,
    tax: 2400,
    insurance: 1200,
    hoa: 0,
    percent: 2.5,
    contribution: 0,
    concession: 0,
    concessionLimit: 15000,
    income: 10000,
    debt: 500,
  });
  /* eslint-disable react-hooks/set-state-in-effect -- Restore browser persistence after hydration and report storage quota errors. */
  // Browser storage is an external system, restored after hydration.

  useEffect(() => {
    setState(createLocalRepository(localStorage).load());
    setReady(true);
  }, []);
  // Report storage quota errors to the user rather than silently losing changes.

  useEffect(() => {
    if (ready) {
      try {
        createLocalRepository(localStorage).save(state);
      } catch {
        setToast(
          "Browser storage is full. Remove large uploads or reset the demo to save changes.",
        );
      }
    }
  }, [state, ready]);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null;
    function keys(e: KeyboardEvent) {
      if (e.key === "Escape") setModal("");
      if (e.key === "Tab") {
        const elements = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".modal button, .modal input, .modal select, .modal textarea, .modal a[href]",
          ),
        );
        const first = elements[0],
          last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("keydown", keys);
      previous?.focus();
    };
  }, [modal]);
  function update(fn: (s: State) => State) {
    setState((s) => fn(s));
  }
  function note(text: string) {
    setToast(text);
  }
  function log(text: string) {
    update((s) => ({
      ...s,
      activity: [text, ...s.activity].slice(0, 40),
      notifications: true,
    }));
  }
  const all = [...demoPropertyProvider.list(), ...state.imported];
  const visibleTransactions =
    state.role === "buyer"
      ? state.transactions.filter(
          (t) => t.buyer === "Alex Morgan" || t.buyer.startsWith(state.name),
        )
      : state.transactions;
  const tx =
    visibleTransactions.find((t) => t.id === state.activePurchaseId) ||
    visibleTransactions[0] ||
    state.transactions[0];
  const activeHome = all.find((p) => p.id === tx?.propertyId) || all[0];
  const workspace =
    path.startsWith("/dashboard") ||
    path.startsWith("/agent") ||
    path.startsWith("/admin");
  const needed = path.startsWith("/agent")
    ? "agent"
    : path.startsWith("/admin")
      ? "admin"
      : "buyer";
  const allowed = !workspace || state.role === needed;
  const selected = all.filter((p) => state.compare.includes(p.id));
  const payment = mortgage(
    calc.price,
    calc.down,
    calc.rate,
    calc.years,
    calc.tax,
    calc.insurance,
    calc.hoa,
  );
  function toggle(id: string, key: "saved" | "compare") {
    update((s) => {
      if (
        key === "compare" &&
        !s.compare.includes(id) &&
        s.compare.length >= 3
      ) {
        note("Compare up to three homes at a time.");
        return s;
      }
      return {
        ...s,
        [key]: s[key].includes(id)
          ? s[key].filter((x) => x !== id)
          : [...s[key], id],
      };
    });
  }
  function enter(role: State["role"]) {
    update((s) => ({ ...s, role }));
    setModal("");
    router.push(role === "buyer" ? "/dashboard" : `/${role}`);
  }
  function search(text: string) {
    const s = parseSearch(text);
    setFilters((f) => ({ ...f, city: s.city, max: s.max, beds: s.beds }));
    setQuery(s.city || s.max || s.beds ? "" : text);
    const target = new URLSearchParams({
      city: s.city,
      max: String(s.max),
      beds: String(s.beds),
      q: s.city || s.max || s.beds ? "" : text,
    });
    router.push(`/homes?${target}`);
  }
  function startPurchase(p: Property) {
    const t: Transaction = {
      id: `purchase-${crypto.randomUUID()}`,
      propertyId: p.id,
      buyer: `${state.name} Morgan`,
      stage: 1,
      tasks: [],
      offer: p.price,
      earnest: 5000,
      financing: "Conventional",
      closing: "",
      notes: "",
      agent: "Jordan Ellis",
    };
    update((s) => ({
      ...s,
      role: "buyer",
      transactions: [t, ...s.transactions],
      activity: [
        `Started a simulated purchase for ${p.address}`,
        ...s.activity,
      ],
    }));
    setTxId(t.id);
    router.push("/dashboard/purchase");
  }
  function setTxId(id: string) {
    update((s) => ({ ...s, activePurchaseId: id }));
  }
  function patchTx(changes: Partial<Transaction>) {
    update((s) => ({
      ...s,
      transactions: s.transactions.map((t) =>
        t.id === tx.id ? { ...t, ...changes } : t,
      ),
    }));
  }
  function numberInput(
    label: string,
    key: keyof typeof calc,
    min = 0,
    max = 10000000,
    step = 1,
  ) {
    return (
      <label>
        {label}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={calc[key]}
          onChange={(e) =>
            setCalc((c) => ({
              ...c,
              [key]: Math.min(max, Math.max(min, Number(e.target.value))),
            }))
          }
        />
      </label>
    );
  }
  function card(p: Property) {
    return <PropertyCard key={p.id} p={p} state={state} toggle={toggle} />;
  }
  function assistant() {
    return (
      <div className="assistant panel">
        <div className="row">
          <span className="ai-icon">
            <Sparkles size={23} />
          </span>
          <div>
            <h3>Your next step, a little clearer.</h3>
            <p>Homebridge AI · scripted demo guide</p>
          </div>
        </div>
        <div className="chat-history" aria-live="polite">
          <div className="bubble guide">
            Hi {state.name}. Finding a home comes with questions. Let’s work
            through them together. What’s on your mind?
          </div>
          {state.chat.map((m, i) => (
            <div
              key={i}
              className={`bubble ${m.role === "user" ? "user" : "guide"}`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="chips">
          {[
            "3 beds in Provo under $550,000",
            "What is earnest money?",
            "What’s next in my purchase?",
          ].map((q) => (
            <button key={q} onClick={() => setChat(q)}>
              {q}
            </button>
          ))}
        </div>
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            if (!chat.trim()) return;
            const text = chat.trim().slice(0, 2000);
            update((s) => ({
              ...s,
              chat: [
                ...s.chat,
                { role: "user", text },
                {
                  role: "assistant",
                  text: localAssistantProvider.answer(
                    text,
                    selected.length ? selected : all,
                    tx,
                  ),
                },
              ],
            }));
            setChat("");
          }}
        >
          <input
            aria-label="Ask Homebridge AI"
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            placeholder="Ask about a home, a term, or your next step…"
            maxLength={2000}
          />
          <button aria-label="Send question" className="btn primary">
            <ArrowRight size={19} />
          </button>
        </form>
        <small>
          Local demonstration responses. No live AI connected. Informational
          only; seek licensed professional review.
        </small>
      </div>
    );
  }
  function finance(pricing = false) {
    const traditional = (calc.price * calc.percent) / 100;
    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">
            {pricing
              ? "A clearer kind of pricing"
              : "MAKE ROOM FOR WHAT MATTERS"}
          </span>
          <h1>
            {pricing
              ? "Big decisions. Clear numbers."
              : "Find your financial comfort zone."}
          </h1>
          <p>
            {pricing
              ? "A proposed flat fee of " +
                money(state.fee) +
                ". Professional support, with less guesswork."
              : "Explore the numbers before you make your next move. All rates and figures are illustrative."}
          </p>
        </div>
        <div className="two-cols">
          <section className="panel">
            <h2>
              {pricing ? "Compare representation fees" : "Your monthly payment"}
            </h2>
            <div className="form-grid">
              {numberInput("Purchase price ($)", "price", 10000)}
              {pricing ? (
                <>
                  {numberInput(
                    "Comparison commission (%)",
                    "percent",
                    0,
                    10,
                    0.1,
                  )}
                  <label>
                    Homebridge fee ($)
                    <input
                      type="number"
                      value={state.fee}
                      min="0"
                      onChange={(e) =>
                        update((s) => ({
                          ...s,
                          fee: Math.max(0, Number(e.target.value)),
                        }))
                      }
                    />
                  </label>
                  {numberInput(
                    "Seller compensation contribution ($)",
                    "contribution",
                  )}
                  {numberInput("Potential concessions ($)", "concession")}
                  {numberInput(
                    "Illustrative concession cap ($)",
                    "concessionLimit",
                  )}
                </>
              ) : (
                <>
                  {numberInput("Down payment (%)", "down", 0, 100, 0.5)}
                  {numberInput(
                    "Illustrative interest rate (%)",
                    "rate",
                    0,
                    20,
                    0.125,
                  )}
                  {numberInput("Loan term (years)", "years", 1, 40)}
                  {numberInput("Annual property taxes ($)", "tax")}
                  {numberInput("Annual insurance ($)", "insurance")}
                  {numberInput("Monthly HOA ($)", "hoa")}
                </>
              )}
            </div>
          </section>
          <section className="panel sage">
            <span className="eyebrow">
              {pricing
                ? "ILLUSTRATIVE FEE DIFFERENCE"
                : "ESTIMATED TOTAL MONTHLY PAYMENT"}
            </span>
            <div className="big-number">
              {money(pricing ? traditional - state.fee : payment.total)}
              <small>{!pricing && "/mo"}</small>
            </div>
            {(pricing
              ? [
                  ["Comparison compensation", traditional],
                  ["Homebridge proposed fee", state.fee],
                  [
                    "Buyer-paid Homebridge remainder",
                    Math.max(0, state.fee - calc.contribution),
                  ],
                  [
                    "Capped potential concessions (not guaranteed)",
                    Math.min(calc.concession, calc.concessionLimit),
                  ],
                ]
              : [
                  ["Principal & interest", payment.pi],
                  ["Property taxes", calc.tax / 12],
                  ["Insurance", calc.insurance / 12],
                  ["HOA", calc.hoa],
                  ["Estimated mortgage insurance", payment.pmi],
                ]
            ).map(([k, v]) => (
              <div className="cost-row" key={k}>
                <span>{k}</span>
                <strong>{money(Number(v))}</strong>
              </div>
            ))}
            <div className="payment-bar">
              <i />
              <i />
              <i />
            </div>
            <p className="fine-print">
              {pricing
                ? "The fee difference is not automatically cash savings or a refund. Compensation and seller contributions are negotiable. Concessions require agreement and lender approval; the cap is a user-entered assumption, not a lender determination. Contributions are modeled against the Homebridge fee only."
                : "Includes illustrative taxes, insurance, and 0.5% annual mortgage insurance below 20% down. Actual loan costs vary. This is not a loan offer or approval."}
            </p>
            {!pricing && (
              <p>
                Down payment: {money(payment.down)} · Total loan interest:{" "}
                {money(payment.interest)}
              </p>
            )}
          </section>
        </div>
        {!pricing && (
          <section className="panel section">
            <h2>A simple affordability check</h2>
            <div className="form-grid">
              {numberInput("Gross monthly income ($)", "income")}
              {numberInput("Other monthly debt ($)", "debt")}
            </div>
            <p>
              Your modeled housing and debt payments use{" "}
              <strong>
                {calc.income
                  ? (((payment.total + calc.debt) / calc.income) * 100).toFixed(
                      1,
                    )
                  : "—"}
                %
              </strong>{" "}
              of gross income. This is an exploration, not underwriting or a
              loan approval.
            </p>
          </section>
        )}
      </>
    );
  }
  function documents() {
    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">EVERYTHING IN ITS PLACE</span>
          <h1>Your document center</h1>
          <p>
            Fictional samples and local demo uploads. Please don’t upload
            sensitive or personal information.
          </p>
        </div>
        <label className="upload panel">
          <Upload />
          <strong>Add a demo document</strong>
          <span>Text or PDF · maximum 2 MB · stored only in this browser</span>
          <input
            aria-label="Upload demo document"
            type="file"
            accept=".txt,.pdf"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 2 * 1024 * 1024) {
                note("Please choose a file smaller than 2 MB.");
                return;
              }
              if (!/\.(txt|pdf)$/i.test(f.name)) {
                note("Please choose a text or PDF file.");
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                update((s) => ({
                  ...s,
                  docs: [
                    ...s.docs,
                    {
                      id: `doc-${crypto.randomUUID()}`,
                      name: f.name,
                      category: "Uploaded document",
                      status: "Uploaded",
                      content: String(reader.result),
                    },
                  ],
                }));
                log(`Uploaded demo document: ${f.name}`);
                note("Demo document saved in this browser.");
              };
              reader.readAsDataURL(f);
            }}
          />
        </label>
        <div className="panel">
          {state.docs.map((d) => (
            <div className="document-row" key={d.id}>
              <Files />
              <div className="grow">
                <strong>{d.name}</strong>
                <p>{d.category}</p>
              </div>
              <span className="badge">{d.status}</span>
              <button
                className="btn subtle"
                onClick={() => {
                  if (d.content.startsWith("data:")) {
                    const a = document.createElement("a");
                    a.href = d.content;
                    a.download = d.name;
                    a.click();
                  } else setModal(`doc:${d.id}`);
                }}
              >
                View
              </button>
              <button
                className="btn subtle"
                onClick={() => {
                  update((s) => ({
                    ...s,
                    docs: s.docs.map((x) =>
                      x.id === d.id ? { ...x, status: "Acknowledged" } : x,
                    ),
                  }));
                  note(
                    "Sample document acknowledged. This is not a signature.",
                  );
                }}
              >
                Acknowledge
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }
  function messages() {
    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">A HUMAN WHEN IT MATTERS</span>
          <h1>Your conversation</h1>
          <p>
            Switch between Buyer and Agent demo roles to reply. No real messages
            are sent.
          </p>
        </div>
        <div className="panel">
          <div className="row">
            <div className="avatar">JE</div>
            <div>
              <h3>Jordan Ellis</h3>
              <p>Demo homebuying professional · Fictional profile</p>
            </div>
            <span className="badge">Demo conversation</span>
          </div>
          <div className="chat-history">
            {state.messages.map((m) => (
              <div
                key={m.id}
                className={`bubble ${m.sender.startsWith("Alex") ? "user" : "guide"}`}
              >
                <small>
                  {m.sender} · {m.time}
                </small>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              if (!message.trim()) return;
              update((s) => ({
                ...s,
                messages: [
                  ...s.messages,
                  {
                    id: String(crypto.randomUUID()),
                    sender:
                      state.role === "buyer"
                        ? `${state.name} · Demo buyer`
                        : "Jordan Ellis · Demo agent",
                    text: message.trim(),
                    time: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                ],
                notifications: true,
              }));
              setMessage("");
              note("Message saved to your local demo conversation.");
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message…"
              aria-label="Message"
              maxLength={2000}
            />
            <button className="btn primary">
              <Send size={17} /> Send
            </button>
          </form>
        </div>
      </>
    );
  }
  function purchase(agent = false) {
    const tasks = [
      "Share preapproval",
      "Review sample disclosures",
      "Prepare inspection questions",
      "Review estimated closing costs",
    ];
    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">YOUR PATH HOME</span>
          <h1>
            {agent ? "Transaction workspace" : "One step closer to your keys."}
          </h1>
          <p>
            Simulated transaction · Milestones require confirmation in the agent
            demo workspace.
          </p>
        </div>
        <label className="transaction-select">
          Choose a purchase
          <select value={tx.id} onChange={(e) => setTxId(e.target.value)}>
            {state.transactions
              .filter(
                (t) =>
                  agent ||
                  t.buyer === "Alex Morgan" ||
                  t.buyer.startsWith(state.name),
              )
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {all.find((p) => p.id === t.propertyId)?.address} · {t.buyer}
                </option>
              ))}
          </select>
        </label>
        <div className="purchase-summary panel">
          <img src={activeHome.image} alt="Illustrative home" />
          <div>
            <span className="badge">{stages[tx.stage]}</span>
            <h2>{activeHome.address}</h2>
            <p>
              {activeHome.city}, Utah · {money(activeHome.price)}
            </p>
            <p>
              {tx.buyer} · Assigned to {tx.agent} (demo)
            </p>
          </div>
          <div className="grow" />
          <div>
            <span className="eyebrow">YOUR PROGRESS</span>
            <h2>{Math.round((tx.stage / 10) * 100)}%</h2>
            <p>{tx.stage + 1} of 11 milestones</p>
          </div>
        </div>
        <div className="two-cols">
          <section className="panel">
            <h2>A clear path forward</h2>
            <div className="timeline">
              {stages.map((s, i) => (
                <div
                  className={`timeline-row ${i <= tx.stage ? "done" : ""}`}
                  key={s}
                >
                  <span>{i < tx.stage ? <Check size={14} /> : i + 1}</span>
                  <div>
                    <strong>{s}</strong>
                    {i === tx.stage && (
                      <p>
                        You’re here ·{" "}
                        {i === 10
                          ? "Demo purchase complete"
                          : "Your agent can help with the next step"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {agent && (
              <>
                <label>
                  Confirm simulated milestone
                  <select
                    value={tx.stage}
                    onChange={(e) => {
                      patchTx({ stage: Number(e.target.value) });
                      log(
                        `Demo agent confirmed ${stages[Number(e.target.value)]} for ${activeHome.address}`,
                      );
                      note("Simulated milestone recorded in activity log.");
                    }}
                  >
                    {stages.map((s, i) => (
                      <option key={s} value={i}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Assigned demo agent
                  <select
                    value={tx.agent}
                    onChange={(e) => {
                      patchTx({ agent: e.target.value });
                      log(
                        `Assigned ${e.target.value} to ${activeHome.address}`,
                      );
                    }}
                  >
                    <option>Jordan Ellis</option>
                    <option>Casey Brooks</option>
                  </select>
                </label>
              </>
            )}
          </section>
          <section>
            <div className="panel">
              <h2>Your next small steps</h2>
              {tasks.map((t) => (
                <label className="task" key={t}>
                  <input
                    type="checkbox"
                    checked={tx.tasks.includes(t)}
                    onChange={() => {
                      patchTx({
                        tasks: tx.tasks.includes(t)
                          ? tx.tasks.filter((x) => x !== t)
                          : [...tx.tasks, t],
                      });
                      log(`Updated checklist: ${t}`);
                    }}
                  />
                  <span>{t}</span>
                </label>
              ))}
              <div className="callout">
                <CalendarDays size={20} />
                <div>
                  <strong>Target closing</strong>
                  <p>
                    {tx.closing || "Discuss with your agent"} · illustrative,
                    not a contractual deadline
                  </p>
                </div>
              </div>
              <Link
                href={agent ? "/agent/messages" : "/dashboard/messages"}
                className="btn outline full"
              >
                Message your {agent ? "buyer" : "demo agent"}{" "}
                <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="panel section">
              <h3>Offer discussion worksheet</h3>
              <p>
                Editable notes for professional review. No offer is created or
                submitted.
              </p>
              <div className="form-grid">
                <label>
                  Proposed price ($)
                  <input
                    type="number"
                    min="0"
                    value={tx.offer}
                    onChange={(e) =>
                      patchTx({ offer: Math.max(0, Number(e.target.value)) })
                    }
                  />
                </label>
                <label>
                  Earnest money ($)
                  <input
                    type="number"
                    min="0"
                    value={tx.earnest}
                    onChange={(e) =>
                      patchTx({ earnest: Math.max(0, Number(e.target.value)) })
                    }
                  />
                </label>
                <label>
                  Financing
                  <select
                    value={tx.financing}
                    onChange={(e) => patchTx({ financing: e.target.value })}
                  >
                    <option>Conventional</option>
                    <option>FHA</option>
                    <option>VA</option>
                    <option>Cash</option>
                  </select>
                </label>
                <label>
                  Target closing date
                  <input
                    type="date"
                    value={tx.closing}
                    onChange={(e) => patchTx({ closing: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Down payment, contingencies, concessions & questions
                <textarea
                  value={tx.notes}
                  onChange={(e) => patchTx({ notes: e.target.value })}
                  placeholder="What would you like your agent to review?"
                />
              </label>
              <button
                className="btn primary"
                onClick={() => {
                  log(
                    `Offer worksheet sent for simulated review: ${activeHome.address}`,
                  );
                  note(
                    "Worksheet flagged for demo agent review. No offer submitted.",
                  );
                }}
              >
                Request demo review <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>
        <section className="panel section">
          <h3>Activity history</h3>
          {state.activity.map((a, i) => (
            <p className="activity" key={i}>
              <span className="dot" />
              {a}
            </p>
          ))}
        </section>
      </>
    );
  }
  function home() {
    return (
      <Homepage
        state={state}
        query={query}
        setQuery={setQuery}
        search={search}
        setModal={setModal}
        card={card}
      />
    );
  }
  function homes() {
    let list = all.filter(
      (p) =>
        (!filters.city || p.city === filters.city) &&
        (!filters.max || p.price <= filters.max) &&
        p.beds >= filters.beds &&
        p.baths >= filters.baths &&
        (!filters.type || p.type === filters.type) &&
        p.sqft >= filters.sqft &&
        p.year >= filters.year &&
        p.lot >= filters.lot &&
        p.garage >= filters.garage &&
        (!filters.status || p.status === filters.status) &&
        (!query ||
          `${p.address} ${p.city} ${p.type}`
            .toLowerCase()
            .includes(query.toLowerCase())),
    );
    list = [...list].sort((a, b) =>
      sort === "Price: low to high"
        ? a.price - b.price
        : sort === "Price: high to low"
          ? b.price - a.price
          : sort === "Most space"
            ? b.sqft - a.sqft
            : 0,
    );
    return (
      <>
        <div className="page-heading search-heading">
          <div>
            <span className="eyebrow">A PLACE TO CALL YOUR OWN</span>
            <h1>Find your kind of home.</h1>
            <p>Explore Utah County, one possibility at a time.</p>
          </div>
          <button className="btn outline" onClick={() => setModal("import")}>
            <Plus size={17} /> Bring a home
          </button>
        </div>
        <div className="filter-bar">
          <div className="search-field">
            <Search size={18} />
            <input
              aria-label="Search city or address"
              placeholder="City, neighborhood, or address"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            aria-label="City"
            value={filters.city}
            onChange={(e) =>
              setFilters((f) => ({ ...f, city: e.target.value }))
            }
          >
            <option value="">All Utah County</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Maximum price"
            value={filters.max}
            onChange={(e) =>
              setFilters((f) => ({ ...f, max: Number(e.target.value) }))
            }
          >
            <option value="0">Any price</option>
            {[450000, 500000, 550000, 650000, 800000].map((n) => (
              <option key={n} value={n}>
                Under {money(n)}
              </option>
            ))}
          </select>
          <select
            aria-label="Bedrooms"
            value={filters.beds}
            onChange={(e) =>
              setFilters((f) => ({ ...f, beds: Number(e.target.value) }))
            }
          >
            <option value="0">Beds</option>
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+ beds
              </option>
            ))}
          </select>
          <button
            className={`btn outline ${advanced ? "selected" : ""}`}
            onClick={() => setAdvanced(!advanced)}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
        {advanced && (
          <div className="panel form-grid advanced">
            <label>
              Property type
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, type: e.target.value }))
                }
              >
                <option value="">All types</option>
                <option>Single family</option>
                <option>Townhome</option>
                <option>Condo</option>
              </select>
            </label>
            {(["baths", "sqft", "year", "lot", "garage"] as const).map((k) => (
              <label key={k}>
                {
                  {
                    baths: "Minimum baths",
                    sqft: "Minimum square feet",
                    year: "Built after",
                    lot: "Minimum lot (acres)",
                    garage: "Minimum garage spaces",
                  }[k]
                }
                <input
                  type="number"
                  min="0"
                  step={k === "lot" ? 0.01 : 1}
                  value={filters[k]}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      [k]: Math.max(0, Number(e.target.value)),
                    }))
                  }
                />
              </label>
            ))}
            <label>
              Listing status
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="">All statuses</option>
                <option>New this week</option>
                <option>Available</option>
              </select>
            </label>
            <button
              className="btn outline"
              onClick={() => {
                setFilters({
                  city: "",
                  max: 0,
                  beds: 0,
                  baths: 0,
                  type: "",
                  sqft: 0,
                  year: 0,
                  lot: 0,
                  garage: 0,
                  status: "",
                });
                setQuery("");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
        <div className="row between results-bar">
          <div>
            <strong>{list.length} possibilities</strong>
            <span className="muted"> · Fictional demo listings</span>
          </div>
          <div className="row">
            <select
              aria-label="Sort homes"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {[
                "Recommended",
                "Price: low to high",
                "Price: high to low",
                "Most space",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <div className="segmented">
              <button
                className={view === "list" ? "selected" : ""}
                onClick={() => setView("list")}
              >
                List
              </button>
              <button
                className={view === "split" ? "selected" : ""}
                onClick={() => setView("split")}
              >
                Map + list
              </button>
              <button
                className={view === "map" ? "selected" : ""}
                onClick={() => setView("map")}
              >
                Map
              </button>
            </div>
          </div>
        </div>
        <div className={view === "split" ? "split-view" : ""}>
          {view !== "map" && (
            <div className="property-grid">{list.map(card)}</div>
          )}
          {view !== "list" && (
            <div className="demo-map">
              <div className="map-road r1" />
              <div className="map-road r2" />
              <div className="map-road r3" />
              <span className="map-label">UTAH COUNTY</span>
              <span className="lake">Utah Lake</span>
              {cities.map((c, i) => (
                <span
                  key={c}
                  className="map-city"
                  style={{
                    left: `${30 + (i % 3) * 22}%`,
                    top: `${15 + i * 10}%`,
                  }}
                >
                  {c}
                </span>
              ))}
              {list.map((p, i) => (
                <Link
                  key={p.id}
                  style={{
                    left: `${20 + ((i * 17) % 65)}%`,
                    top: `${15 + ((i * 13) % 68)}%`,
                  }}
                  className="map-pin"
                  href={`/homes/${p.id}`}
                  aria-label={`View ${p.address}`}
                >
                  {money(p.price / 1000)}k
                </Link>
              ))}
              <div className="map-disclaimer">
                Schematic area map · approximate demo positions, not actual
                listing locations
              </div>
            </div>
          )}
        </div>
        {!list.length && (
          <div className="empty">
            <Search />
            <h2>A fresh search might open a new door.</h2>
            <p>Try another city, a higher budget, or fewer filters.</p>
            <button
              className="btn primary"
              onClick={() => {
                setQuery("");
                setFilters({
                  city: "",
                  max: 0,
                  beds: 0,
                  baths: 0,
                  type: "",
                  sqft: 0,
                  year: 0,
                  lot: 0,
                  garage: 0,
                  status: "",
                });
              }}
            >
              Show all homes
            </button>
          </div>
        )}
        <div className="collection-note">
          <Sparkles size={20} />
          <p>
            Need a second perspective? Our demo guide can help you think it
            through.
          </p>
          <Link
            href="/dashboard/assistant"
            className="text-link"
            onClick={() => {
              if (!state.role) update((s) => ({ ...s, role: "buyer" }));
            }}
          >
            Ask Homebridge AI <ArrowRight size={16} />
          </Link>
        </div>
      </>
    );
  }
  function detail() {
    const p = all.find((h) => h.id === path.split("/")[2]);
    if (!p)
      return (
        <div className="empty">
          <h1>That home isn’t in this demo.</h1>
          <Link className="btn primary" href="/homes">
            Explore homes
          </Link>
        </div>
      );
    return (
      <>
        <div className="row between detail-nav">
          <Link className="text-link" href="/homes">
            <ArrowLeft size={16} /> Back to homes
          </Link>
          <div className="row">
            <button
              className="btn outline"
              onClick={() => toggle(p.id, "saved")}
            >
              <Heart size={16} />
              {state.saved.includes(p.id) ? "Saved" : "Save home"}
            </button>
            <button
              className="btn outline"
              onClick={() => toggle(p.id, "compare")}
            >
              <GitCompareArrows size={16} />
              {state.compare.includes(p.id) ? "Added to comparison" : "Compare"}
            </button>
          </div>
        </div>
        <div className="gallery">
          <img
            className="gallery-main"
            src={gallery === 0 ? p.image : photo(gallery)}
            alt="Illustrative architectural illustration"
          />
          <div>
            {[1, 2].map((n) => (
              <button
                key={n}
                onClick={() => setGallery(gallery === n ? 0 : n)}
                aria-label={`View illustrative photo ${n}`}
              >
                <img
                  src={photo(n)}
                  alt="Alternative generated architectural illustration"
                />
              </button>
            ))}
          </div>
          <span className="photo-note">
            ILLUSTRATIVE AI ILLUSTRATIONS · NOT PHOTOGRAPHS OF THIS FICTIONAL
            ADDRESS
          </span>
        </div>
        <div className="detail-layout">
          <div>
            <span className="eyebrow">
              FICTIONAL LISTING · {p.status.toUpperCase()}
            </span>
            <h1>{money(p.price)}</h1>
            <h2>{p.address}</h2>
            <p className="muted">
              {p.city}, Utah County, UT · Fictional address
            </p>
            <div className="detail-facts">
              <span>
                <BedDouble />
                {p.beds} bedrooms
              </span>
              <span>
                <Bath />
                {p.baths} bathrooms
              </span>
              <span>
                <Maximize />
                {p.sqft.toLocaleString()} sq ft
              </span>
            </div>
            <section className="detail-section">
              <h2>A place for your everyday.</h2>
              <p>{p.description}</p>
              <div className="form-grid">
                <p>
                  Type <strong>{p.type}</strong>
                </p>
                <p>
                  Built <strong>{p.year}</strong>
                </p>
                <p>
                  Lot <strong>{p.lot.toFixed(2)} acres</strong>
                </p>
                <p>
                  Garage <strong>{p.garage} spaces</strong>
                </p>
              </div>
              <div className="chips">
                {p.features.map((f) => (
                  <span key={f}>
                    <Check size={14} />
                    {f}
                  </span>
                ))}
              </div>
            </section>
            <section className="detail-section">
              <h2>The neighborhood, at a glance.</h2>
              <p>
                This fictional example sits in the general {p.city} area.
                Explore commute routes, amenities, property condition, and local
                services independently. No school ratings, crime claims, or
                neighborhood suitability judgments are supplied.
              </p>
              <div className="neighborhood">
                <MapPin />
                <span>
                  {p.city}, Utah · approximate area {p.lat.toFixed(2)},{" "}
                  {p.lng.toFixed(2)}
                </span>
                <small>Representative coordinates only</small>
              </div>
            </section>
            <section className="detail-section">
              <h2>A little pricing context.</h2>
              <p>Simulated pricing history · not market data or an appraisal</p>
              <div className="cost-row">
                <span>Initial fictional asking price</span>
                <strong>{money(p.price + 12000)}</strong>
              </div>
              <div className="cost-row">
                <span>Current fictional asking price</span>
                <strong>{money(p.price)}</strong>
              </div>
              <h3>Other demo homes to consider</h3>
              {all
                .filter(
                  (h) => h.id !== p.id && Math.abs(h.price - p.price) < 75000,
                )
                .slice(0, 3)
                .map((h) => (
                  <Link key={h.id} className="cost-row" href={`/homes/${h.id}`}>
                    <span>
                      {h.address} · {h.city}
                    </span>
                    <strong>
                      {money(h.price)} <ArrowUpRight size={14} />
                    </strong>
                  </Link>
                ))}
            </section>
            {assistant()}
          </div>
          <aside>
            <div className="panel sticky-card">
              <span className="eyebrow">SEE THE POSSIBILITIES</span>
              <h2>
                Make your next move
                <br />
                with confidence.
              </h2>
              <p>Keep your questions, documents, and next steps together.</p>
              <div className="estimate">
                <small>ILLUSTRATIVE MONTHLY PAYMENT</small>
                <h2>
                  {money(mortgage(p.price, 20, 6.5, 30, 2400, 1200, 0).total)}
                  <small>/mo</small>
                </h2>
                <p>
                  20% down · 6.5% · 30 years
                  <br />
                  Includes illustrative taxes & insurance
                </p>
              </div>
              <button
                className="btn primary full"
                onClick={() => startPurchase(p)}
              >
                Start a demo purchase <ArrowRight size={17} />
              </button>
              <button
                className="btn outline full"
                onClick={() => setModal(`tour:${p.id}`)}
              >
                Request a demo tour
              </button>
              <Link
                href={`/dashboard/finances?price=${p.price}`}
                className="text-link"
                onClick={() => {
                  setCalc((c) => ({ ...c, price: p.price }));
                  update((s) => ({ ...s, role: "buyer" }));
                }}
              >
                Customize payment estimate <ArrowUpRight size={15} />
              </Link>
              <p className="fine-print">
                No representation, tour, offer, or professional service is
                established. Fictional demo only.
              </p>
            </div>
          </aside>
        </div>
      </>
    );
  }
  function compare() {
    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">THE DETAILS, SIDE BY SIDE</span>
          <h1>Find the fit for your life.</h1>
          <p>
            Select up to three homes using the Compare button on any listing.
          </p>
        </div>
        {!selected.length ? (
          <div className="empty">
            <GitCompareArrows />
            <h2>A little perspective goes a long way.</h2>
            <Link className="btn primary" href="/homes">
              Choose homes to compare
            </Link>
          </div>
        ) : (
          <>
            <div className="comparison">
              {selected.map((p) => (
                <div className="panel" key={p.id}>
                  <img src={p.image} alt="Illustrative home" />
                  <h3>{p.address}</h3>
                  <p>{p.city}</p>
                  {[
                    ["Price", money(p.price)],
                    ["Bedrooms", p.beds],
                    ["Bathrooms", p.baths],
                    ["Living area", `${p.sqft} sq ft`],
                    ["Type", p.type],
                    [
                      "Illustrative monthly",
                      money(
                        mortgage(p.price, 20, 6.5, 30, 2400, 1200, 0).total,
                      ),
                    ],
                  ].map(([k, v]) => (
                    <div className="cost-row" key={k}>
                      <span>{k}</span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                  <button
                    className="btn outline full"
                    onClick={() => toggle(p.id, "compare")}
                  >
                    Remove
                  </button>
                  <Link href={`/homes/${p.id}`} className="text-link">
                    View home <ArrowUpRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
            <p className="fine-print">
              Payments assume 20% down, 6.5% for 30 years, $2,400 annual tax and
              $1,200 insurance. No HOA assumed. These are fictional comparisons.
            </p>
            <button
              className="btn primary"
              onClick={() => {
                update((s) => ({
                  ...s,
                  chat: [
                    ...s.chat,
                    { role: "user", text: "Compare these homes" },
                    {
                      role: "assistant",
                      text: localAssistantProvider.answer(
                        "Compare",
                        selected,
                        tx,
                      ),
                    },
                  ],
                }));
                router.push("/dashboard/assistant");
              }}
            >
              <Sparkles size={16} /> Explain this comparison
            </button>
          </>
        )}
      </>
    );
  }
  function overview() {
    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>
            Welcome back, {state.name}.<br />
            Let’s get you home.
          </h1>
          <p>A little more clarity. A little closer to your front door.</p>
        </div>
        <div className="stats-grid">
          {[
            ["Saved homes", state.saved.length, Heart],
            [
              "Your purchases",
              state.transactions.filter(
                (t) =>
                  t.buyer === "Alex Morgan" || t.buyer.startsWith(state.name),
              ).length,
              Home,
            ],
            ["Tasks completed", tx.tasks.length, CheckCircle2],
            ["Your proposed fee", money(state.fee), Wallet],
          ].map(([title, v, Icon]) => {
            const I = Icon as typeof Heart;
            return (
              <div className="stat panel" key={String(title)}>
                <I size={20} />
                <strong>{String(v)}</strong>
                <span>{String(title)}</span>
              </div>
            );
          })}
        </div>
        <div className="two-cols section">
          <div className="panel">
            <div className="row between">
              <h2>Your path home</h2>
              <span className="badge">{stages[tx.stage]}</span>
            </div>
            <div className="dashboard-home">
              <img src={activeHome.image} alt="Illustrative home" />
              <div>
                <h3>{activeHome.address}</h3>
                <p>
                  {activeHome.city} · {money(activeHome.price)}
                </p>
              </div>
            </div>
            <div className="progress">
              <i style={{ width: `${(tx.stage / 10) * 100}%` }} />
            </div>
            <p>
              {tx.tasks.length} personal tasks completed · Next milestone:{" "}
              {stages[Math.min(10, tx.stage + 1)]}
            </p>
            <Link className="btn primary" href="/dashboard/purchase">
              View your purchase <ArrowRight size={16} />
            </Link>
          </div>
          <div className="panel sage">
            <span className="ai-icon">
              <Sparkles />
            </span>
            <h2>A question on your mind?</h2>
            <p>
              From earnest money to what comes next, your demo guide helps make
              the unfamiliar feel familiar.
            </p>
            <Link className="text-link" href="/dashboard/assistant">
              Let’s talk it through <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="section-heading section">
          <h2>Homes you’re thinking about</h2>
          <Link href="/dashboard/saved" className="text-link">
            See saved homes <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="property-grid">
          {all
            .filter((p) => state.saved.includes(p.id))
            .slice(0, 3)
            .map(card)}
        </div>
        <div className="panel section">
          <h3>Recently in your journey</h3>
          {state.activity.slice(0, 4).map((a, i) => (
            <p className="activity" key={i}>
              <span className="dot" />
              {a}
            </p>
          ))}
          <Link className="text-link" href="/dashboard/messages">
            Jordan shared a sample checklist. View conversation{" "}
            <ArrowRight size={15} />
          </Link>
        </div>
      </>
    );
  }
  function settings() {
    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h1>Your preferences</h1>
          <p>
            Saved locally in this browser. No real account or sensitive
            financial information is required.
          </p>
        </div>
        <section className="panel">
          <label>
            First name
            <input
              value={state.name}
              onChange={(e) =>
                update((s) => ({ ...s, name: e.target.value.slice(0, 40) }))
              }
            />
          </label>
          <div className="form-grid">
            {Object.entries(state.preferences).map(([k, v]) => (
              <label key={k}>
                {k.charAt(0).toUpperCase() + k.slice(1)}
                <input
                  value={v}
                  onChange={(e) =>
                    update((s) => ({
                      ...s,
                      preferences: { ...s.preferences, [k]: e.target.value },
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <p className="badge">Changes save automatically</p>
        </section>
        <section className="panel section">
          <h2>A fresh start</h2>
          <p>
            Reset all sample homes, messages, documents, preferences, and
            purchases in this browser.
          </p>
          <button className="btn outline" onClick={() => setModal("reset")}>
            Reset demonstration data
          </button>
        </section>
      </>
    );
  }
  function operations(admin = false) {
    const sub = path.split("/")[2];
    if (sub === "messages") return messages();
    if (sub === "transactions") return purchase(true);
    if (sub === "settings")
      return (
        <>
          <div className="page-heading">
            <span className="eyebrow">BROKERAGE DEMONSTRATION</span>
            <h1>Business settings</h1>
            <p>Local-only configuration. No operational brokerage services.</p>
          </div>
          <section className="panel">
            <label>
              Proposed representation fee ($)
              <input
                type="number"
                min="0"
                value={state.fee}
                onChange={(e) =>
                  update((s) => ({
                    ...s,
                    fee: Math.max(0, Number(e.target.value)),
                  }))
                }
              />
            </label>
            <p>Updates the homepage and calculators in this browser.</p>
            <Link href="/" className="btn outline">
              Preview homepage
            </Link>
            <button className="btn subtle" onClick={() => setModal("reset")}>
              Reset all demo data
            </button>
          </section>
        </>
      );
    if (sub === "team")
      return (
        <>
          <div className="page-heading">
            <h1>A small team. A shared mission.</h1>
            <p>
              Fictional team · assign these profiles in the transaction
              workspace.
            </p>
          </div>
          <div className="two-cols">
            {["Jordan Ellis", "Casey Brooks"].map((n) => (
              <div className="panel" key={n}>
                <div className="avatar">
                  {n
                    .split(" ")
                    .map((x) => x[0])
                    .join("")}
                </div>
                <h2>{n}</h2>
                <p>
                  Demo agent ·{" "}
                  {state.transactions.filter((t) => t.agent === n).length}{" "}
                  assigned purchases
                </p>
                <Link href="/admin/transactions" className="btn outline">
                  Manage assignments
                </Link>
              </div>
            ))}
          </div>
        </>
      );
    if (sub === "tasks")
      return (
        <>
          <div className="page-heading">
            <h1>The details that move things forward.</h1>
            <p>Review personal checklists and simulated closing targets.</p>
          </div>
          {state.transactions.map((t) => (
            <div className="panel section" key={t.id}>
              <h3>
                {t.buyer} · {all.find((p) => p.id === t.propertyId)?.address}
              </h3>
              <p>
                {t.tasks.length} personal tasks done · Target{" "}
                {t.closing || "Not set"}
              </p>
              <button
                className="btn outline"
                onClick={() => {
                  setTxId(t.id);
                  router.push("/agent/transactions");
                }}
              >
                Review checklist
              </button>
            </div>
          ))}
        </>
      );
    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">
            {admin
              ? "BROKERAGE AT A GLANCE"
              : "MORE TIME FOR THE MOMENTS THAT MATTER"}
          </span>
          <h1>
            {sub === "clients"
              ? "People, before paperwork."
              : sub === "leads"
                ? "A new chapter for every lead."
                : sub === "analytics"
                  ? "The model behind the mission."
                  : admin
                    ? "A clearer view of your business."
                    : "Good morning, Jordan."}
          </h1>
          <p>
            Fictional operational workspace · all figures and profiles are
            demonstration data.
          </p>
        </div>
        <div className="stats-grid">
          {(admin
            ? [
                ["Active buyer clients", 3],
                [
                  "Modeled gross fees",
                  money(
                    state.fee *
                      state.transactions.filter((t) => t.stage === 10).length,
                  ),
                ],
                [
                  "Pipeline fee potential",
                  money(
                    state.fee *
                      state.transactions.filter((t) => t.stage < 10).length,
                  ),
                ],
                ["Illustrative cycle", "42 days"],
              ]
            : [
                [
                  "Assigned purchases",
                  state.transactions.filter((t) => t.agent === "Jordan Ellis")
                    .length,
                ],
                [
                  "Offer worksheets",
                  state.transactions.filter((t) => t.stage === 3).length,
                ],
                [
                  "Documents to review",
                  state.docs.filter(
                    (d) =>
                      d.status === "Under Review" || d.status === "Uploaded",
                  ).length,
                ],
                ["Demo messages", state.messages.length],
              ]
          ).map(([label, value]) => (
            <div className="stat panel" key={label}>
              <TrendingUp size={20} />
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <section className="panel section">
          <div className="section-heading">
            <h2>
              {sub === "leads" ? "Demo buyer pipeline" : "Purchases in motion"}
            </h2>
            <span className="badge">LOCAL DEMO</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Property</th>
                  <th>Milestone</th>
                  <th>Agent</th>
                  <th>Target close</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {state.transactions.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.buyer}</strong>
                      <p>Demo client</p>
                    </td>
                    <td>{all.find((p) => p.id === t.propertyId)?.address}</td>
                    <td>
                      <span className="badge">{stages[t.stage]}</span>
                    </td>
                    <td>{t.agent}</td>
                    <td>{t.closing || "Not set"}</td>
                    <td>
                      <button
                        className="btn subtle"
                        onClick={() => {
                          setTxId(t.id);
                          router.push(
                            admin
                              ? "/admin/transactions"
                              : "/agent/transactions",
                          );
                        }}
                      >
                        Review <ArrowUpRight size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="two-cols section">
          <div className="panel">
            <h2>Pipeline by stage</h2>
            {[3, 6, 8, 10].map((n) => (
              <div className="pipeline-row" key={n}>
                <span>{stages[n]}</span>
                <div className="progress">
                  <i
                    style={{
                      width: `${Math.max(3, (state.transactions.filter((t) => t.stage === n).length / state.transactions.length) * 100)}%`,
                    }}
                  />
                </div>
                <strong>
                  {state.transactions.filter((t) => t.stage === n).length}
                </strong>
              </div>
            ))}
            <p className="fine-print">
              Sample activity is not an operating-business performance claim.
            </p>
          </div>
          <div className="panel sage">
            <h2>
              {admin
                ? "Built around sustainable support."
                : "Today’s professional review queue"}
            </h2>
            <p>
              {admin
                ? "Illustrative cost per completed transaction: $1,250. Modeled contribution per transaction: " +
                  money(state.fee - 1250) +
                  ". Fixed overhead, taxes, acquisition costs, and real expenses are excluded."
                : "Review offer worksheets, sample disclosures, and checklist questions. No actual legal documents or offers are submitted."}
            </p>
            <Link
              href={admin ? "/admin/settings" : "/agent/transactions"}
              className="btn outline"
            >
              {admin
                ? "Adjust business assumptions"
                : "Open transaction workspace"}{" "}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </>
    );
  }
  function onboarding() {
    const labels = [
      "Your kind of place",
      "Your next chapter",
      "Ready when you are",
    ];
    return (
      <div className="onboarding">
        <span className="eyebrow">LET’S MAKE THIS FEEL LIKE YOU</span>
        <h1>{labels[step]}</h1>
        <p>
          A few preferences help organize your demo journey. You can change
          these anytime.
        </p>
        <div className="onboarding-progress">
          {labels.map((l, i) => (
            <span className={i <= step ? "selected" : ""} key={l} />
          ))}
        </div>
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 2) setStep(step + 1);
            else {
              update((s) => ({ ...s, role: "buyer" }));
              router.push("/dashboard");
            }
          }}
        >
          <span className="eyebrow">STEP {step + 1} OF 3</span>
          <h2>
            {step === 0
              ? "Where do you picture yourself?"
              : step === 1
                ? "What does your timeline look like?"
                : "A little about your starting point."}
          </h2>
          <div className="form-grid">
            {(step === 0
              ? ["location", "budget", "beds", "baths", "type"]
              : step === 1
                ? ["timeline", "financing"]
                : ["found", "agent"]
            ).map((k) => (
              <label key={k}>
                {
                  (
                    {
                      location: "Preferred city",
                      budget: "Home budget ($)",
                      beds: "Bedrooms",
                      baths: "Bathrooms",
                      type: "Property type",
                      timeline: "Buying timeline",
                      financing: "Financing status",
                      found: "Have you found a home?",
                      agent: "Do you currently have an agent?",
                    } as Record<string, string>
                  )[k]
                }
                {k === "location" ? (
                  <select
                    value={state.preferences[k]}
                    onChange={(e) =>
                      update((s) => ({
                        ...s,
                        preferences: { ...s.preferences, [k]: e.target.value },
                      }))
                    }
                  >
                    {cities.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    required={k === "budget"}
                    type={
                      ["budget", "beds", "baths"].includes(k)
                        ? "number"
                        : "text"
                    }
                    min="0"
                    value={state.preferences[k]}
                    onChange={(e) =>
                      update((s) => ({
                        ...s,
                        preferences: { ...s.preferences, [k]: e.target.value },
                      }))
                    }
                  />
                )}
              </label>
            ))}
          </div>
          <div className="row between section">
            {step > 0 ? (
              <button
                type="button"
                className="btn subtle"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <button
                type="button"
                className="btn subtle"
                onClick={() => enter("buyer")}
              >
                Skip for now
              </button>
            )}
            <button className="btn primary">
              {step === 2 ? "Open my demo" : "Continue"}{" "}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
        <p className="fine-print">
          No account or payment required. Preferences stay in your browser.
        </p>
      </div>
    );
  }
  function publicPage() {
    if (path === "/pricing") return finance(true);
    if (path === "/get-started") return onboarding();
    if (path === "/login")
      return (
        <div className="onboarding">
          <span className="eyebrow">WELCOME TO YOUR NEXT CHAPTER</span>
          <h1>Make yourself at home.</h1>
          <p>No password needed. Choose a local demo workspace to explore.</p>
          {roleCards()}
        </div>
      );
    if (path === "/contact")
      return (
        <>
          <div className="page-heading">
            <span className="eyebrow">LET’S START A CONVERSATION</span>
            <h1>A little help goes a long way.</h1>
            <p>
              This demonstration form stores your request locally; it sends no
              email.
            </p>
          </div>
          <form
            className="panel narrow"
            onSubmit={(e) => {
              e.preventDefault();
              log("Demo consultation request recorded");
              note(
                "Your demo request was recorded locally. No email was sent.",
              );
              e.currentTarget.reset();
            }}
          >
            <label>
              Name
              <input required maxLength={100} />
            </label>
            <label>
              Email
              <input required type="email" />
            </label>
            <label>
              What’s on your mind?
              <textarea required maxLength={2000} />
            </label>
            <button className="btn primary">
              Record demo request <ArrowRight size={16} />
            </button>
          </form>
        </>
      );
    const about = path === "/about";
    const resources = path === "/resources";
    const known = [
      "/about",
      "/resources",
      "/how-it-works",
      "/sellers",
    ].includes(path);
    if (!known)
      return (
        <div className="empty">
          <h1>Let’s get you back home.</h1>
          <p>This page isn’t part of our demo.</p>
          <Link href="/" className="btn primary">
            Go home
          </Link>
        </div>
      );
    if (path === "/sellers")
      return (
        <div className="demo-banner section">
          <span className="badge">COMING SOON</span>
          <h1>
            Your next chapter.
            <br />
            On both sides of the door.
          </h1>
          <p>
            Concept preview: listing preparation, professional pricing guidance,
            showing coordination, and offer comparison. Seller services are not
            operational.
          </p>
          <Link href="/contact" className="btn cream">
            Share your interest <ArrowUpRight size={16} />
          </Link>
        </div>
      );
    return (
      <>
        <div className="editorial-hero">
          <span className="eyebrow">
            {about
              ? "A NEW APPROACH TO AN IMPORTANT CHAPTER"
              : resources
                ? "A LITTLE KNOWLEDGE. A LOT MORE CONFIDENCE."
                : "FROM FIRST LOOK TO FRONT DOOR"}
          </span>
          <h1>
            {about ? (
              <>
                Homebuying should feel
                <br />
                like a possibility.
                <br />
                <em>Not a puzzle.</em>
              </>
            ) : resources ? (
              <>
                Good guidance.
                <br />
                <em>Every step of the way.</em>
              </>
            ) : (
              <>
                Your homebuying journey.
                <br />
                <em>A little more human.</em>
              </>
            )}
          </h1>
          <p>
            {about
              ? "Homebridge is a concept for bringing thoughtful technology, transparent pricing, and professional support together. Because finding home should come with more clarity."
              : resources
                ? "Plain-language starting points for the decisions ahead. Informational demo content, not legal or lending advice."
                : "Explore at your pace. Know what’s next. Have a professional there for the decisions that matter."}
          </p>
        </div>
        {resources ? (
          <div className="three-cols">
            {[
              "Earnest money",
              "Closing costs",
              "Preapproval",
              "Contingencies",
              "Offer preparation",
              "Due diligence",
            ].map((t) => (
              <article className="panel" key={t}>
                <span className="ai-icon">
                  <Files size={20} />
                </span>
                <h2>{t}</h2>
                <p>{localAssistantProvider.answer(t, all, tx)}</p>
                <button
                  className="text-link"
                  onClick={() => {
                    update((s) => ({
                      ...s,
                      role: "buyer",
                      chat: [
                        ...s.chat,
                        { role: "user", text: `Explain ${t}` },
                        {
                          role: "assistant",
                          text: localAssistantProvider.answer(t, all, tx),
                        },
                      ],
                    }));
                    router.push("/dashboard/assistant");
                  }}
                >
                  Keep exploring <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <>
            <div className="three-cols">
              {[
                [
                  "01",
                  "Explore your possibilities",
                  "Browse fictional Utah County homes, save favorites, or manually bring in a home from elsewhere.",
                ],
                [
                  "02",
                  "Get your bearings",
                  "Compare your shortlist, explore payment assumptions, and work through questions with the local demo guide.",
                ],
                [
                  "03",
                  "Move forward with support",
                  "Start a simulated purchase, organize documents, and follow professional-reviewed milestones.",
                ],
              ].map(([n, t, d]) => (
                <div className="step-card" key={n}>
                  <span>{n}</span>
                  <h2>{t}</h2>
                  <p>{d}</p>
                </div>
              ))}
            </div>
            <div className="panel sage section">
              <h2>Human judgment belongs at the heart of the process.</h2>
              <p>
                Actual representation, offers, negotiations, and legal
                agreements would require a real licensed brokerage and approved
                procedures. This prototype demonstrates the experience only.
              </p>
              <button className="btn primary" onClick={() => setModal("demo")}>
                Walk through the demo <ArrowUpRight size={16} />
              </button>
            </div>
          </>
        )}
      </>
    );
  }
  function roleCards() {
    return (
      <div className="role-cards">
        {(
          [
            [
              "buyer",
              "Find your way home",
              "Save homes, compare your options, and follow a purchase.",
            ],
            [
              "agent",
              "Support the next step",
              "Review demo clients, update milestones, and reply to messages.",
            ],
            [
              "admin",
              "See the bigger picture",
              "Explore the pipeline, modeled fees, and team assignments.",
            ],
          ] as const
        ).map(([r, t, d]) => (
          <button key={r} className="role-card" onClick={() => enter(r)}>
            <span className="eyebrow">
              {r === "admin" ? "BROKERAGE ADMINISTRATOR" : r.toUpperCase()}
            </span>
            <h3>{t}</h3>
            <p>{d}</p>
            <span className="text-link">
              Enter {r} demo <ArrowUpRight size={17} />
            </span>
          </button>
        ))}
      </div>
    );
  }
  function renderModal() {
    if (!modal) return null;
    return (
      <div
        className="modal-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal("");
        }}
      >
        <section
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-label={
            modal === "import"
              ? "Bring a home"
              : modal === "demo"
                ? "Explore demo"
                : "Demo action"
          }
        >
          <button
            autoFocus
            className="modal-close"
            aria-label="Close dialog"
            onClick={() => setModal("")}
          >
            <X />
          </button>
          {modal === "demo" ? (
            <>
              <span className="eyebrow">A LITTLE LOOK AT WHAT’S POSSIBLE</span>
              <h2>Find your seat at Homebridge.</h2>
              <p>
                Three perspectives. One connected, local demonstration. No real
                accounts, emails, or transactions.
              </p>
              {roleCards()}
            </>
          ) : modal === "reset" ? (
            <>
              <h2>A fresh start?</h2>
              <p>
                This removes demo changes in this browser, including uploads and
                messages, and restores the sample data.
              </p>
              <button
                className="btn primary"
                onClick={() => {
                  setState(initialState());
                  setTxId("purchase-1");
                  setModal("");
                  router.push("/");
                  note("Sample data restored.");
                }}
              >
                Reset demo data
              </button>
              <button className="btn subtle" onClick={() => setModal("")}>
                Keep exploring
              </button>
            </>
          ) : modal.startsWith("doc:") ? (
            <>
              <span className="eyebrow">
                FICTIONAL SAMPLE · NOT A LEGAL AGREEMENT
              </span>
              <h2>{state.docs.find((d) => d.id === modal.slice(4))?.name}</h2>
              <pre className="sample-document">
                {state.docs.find((d) => d.id === modal.slice(4))?.content}
              </pre>
              <button
                className="btn primary"
                onClick={() => {
                  const d = state.docs.find((d) => d.id === modal.slice(4));
                  if (!d) return;
                  const u = URL.createObjectURL(
                    new Blob([d.content], { type: "text/plain" }),
                  );
                  const a = document.createElement("a");
                  a.href = u;
                  a.download = d.name;
                  a.click();
                  URL.revokeObjectURL(u);
                }}
              >
                Download sample
              </button>
            </>
          ) : modal.startsWith("tour:") ? (
            <>
              <span className="eyebrow">SIMULATED SCHEDULING</span>
              <h2>Picture your next visit.</h2>
              <p>No actual tour is booked or sent to anyone.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  log(
                    `Demo tour requested for ${f.get("date")} at ${f.get("time")}`,
                  );
                  setModal("");
                  note(
                    "Demo tour request recorded locally. No real tour is booked.",
                  );
                }}
              >
                <label>
                  Preferred date
                  <input
                    required
                    name="date"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </label>
                <label>
                  Preferred time
                  <select name="time">
                    <option>10:00 AM</option>
                    <option>1:00 PM</option>
                    <option>4:00 PM</option>
                  </select>
                </label>
                <button className="btn primary">
                  Save demo request <CalendarDays size={16} />
                </button>
              </form>
            </>
          ) : modal === "notifications" ? (
            <>
              <h2>A little update for your journey.</h2>
              {state.activity.slice(0, 6).map((a, i) => (
                <p className="activity" key={i}>
                  <span className="dot" />
                  {a}
                </p>
              ))}
              <button
                className="btn outline"
                onClick={() => {
                  update((s) => ({ ...s, notifications: false }));
                  setModal("");
                }}
              >
                Mark as read
              </button>
            </>
          ) : modal === "import" ? (
            <>
              <span className="eyebrow">YOUR SEARCH CAN START ANYWHERE</span>
              <h2>Already found a home?</h2>
              <p>
                Add the details you know. We don’t fetch or scrape listing
                websites. Every field below is entered by you.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  const url = String(f.get("url") || "");
                  if (url) {
                    try {
                      const u = new URL(url);
                      if (!["https:", "http:"].includes(u.protocol))
                        throw Error();
                    } catch {
                      note("Enter a valid http or https listing URL.");
                      return;
                    }
                  }
                  const p: Property = {
                    id: `import-${crypto.randomUUID()}`,
                    address: String(f.get("address")),
                    city: String(f.get("city")),
                    price: Number(f.get("price")),
                    beds: Number(f.get("beds")),
                    baths: Number(f.get("baths")),
                    sqft: Number(f.get("sqft")),
                    type: String(f.get("type")),
                    year: Number(f.get("year")) || 2000,
                    garage: 0,
                    lot: 0,
                    image: photo(1),
                    description:
                      "Manually entered demo property. Details have not been fetched, verified, or supplied by a listing service. The image is illustrative AI-generated architectural illustrations.",
                    features: [
                      "Manually supplied details",
                      "Unverified information",
                    ],
                    status: "Manually added",
                    lat: 40.23,
                    lng: -111.66,
                    url,
                  };
                  update((s) => ({
                    ...s,
                    imported: [...s.imported, p],
                    saved: [...s.saved, p.id],
                  }));
                  setModal("");
                  router.push(`/homes/${p.id}`);
                  note(
                    "Your manually entered home was saved. No listing details were fetched.",
                  );
                }}
              >
                <label>
                  Listing URL (optional)
                  <input name="url" type="url" placeholder="https://…" />
                </label>
                <label>
                  Property address
                  <input
                    required
                    name="address"
                    placeholder="Use a fictional address for this demo"
                    maxLength={120}
                  />
                </label>
                <div className="form-grid">
                  <label>
                    City
                    <select name="city">
                      {cities.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Price ($)
                    <input
                      required
                      type="number"
                      min="1"
                      name="price"
                      defaultValue="500000"
                    />
                  </label>
                  <label>
                    Bedrooms
                    <input
                      required
                      type="number"
                      min="0"
                      max="30"
                      name="beds"
                      defaultValue="3"
                    />
                  </label>
                  <label>
                    Bathrooms
                    <input
                      required
                      type="number"
                      min="0"
                      max="30"
                      step=".5"
                      name="baths"
                      defaultValue="2"
                    />
                  </label>
                  <label>
                    Square feet
                    <input
                      required
                      type="number"
                      min="1"
                      name="sqft"
                      defaultValue="2000"
                    />
                  </label>
                  <label>
                    Property type
                    <select name="type">
                      <option>Single family</option>
                      <option>Townhome</option>
                      <option>Condo</option>
                    </select>
                  </label>
                  <label>
                    Year built
                    <input
                      type="number"
                      min="1800"
                      max="2100"
                      name="year"
                      defaultValue="2010"
                    />
                  </label>
                </div>
                <button className="btn primary">
                  Save manually entered home <ArrowRight size={16} />
                </button>
              </form>
            </>
          ) : null}
        </section>
      </div>
    );
  }
  let content: React.ReactNode;
  if (!allowed)
    content = (
      <div className="onboarding">
        <span className="eyebrow">CHOOSE YOUR DEMO PERSPECTIVE</span>
        <h1>
          {state.role
            ? "This is a different workspace."
            : "Welcome. Make yourself at home."}
        </h1>
        <p>
          {state.role
            ? `You’re exploring as ${state.role}. Enter the ${needed} demo to open this area.`
            : "Choose a role to start. Demo permissions organize the experience; these are not real authenticated accounts."}
        </p>
        {roleCards()}
      </div>
    );
  else if (path === "/") content = home();
  else if (path === "/homes") content = homes();
  else if (path.startsWith("/homes/")) content = detail();
  else if (path.startsWith("/agent") || path.startsWith("/admin"))
    content = operations(path.startsWith("/admin"));
  else if (path === "/dashboard") content = overview();
  else if (path === "/dashboard/saved")
    content = (
      <>
        <div className="page-heading">
          <span className="eyebrow">THE ONES THAT FEEL LIKE YOU</span>
          <h1>A little shortlist. A lot of possibility.</h1>
          <p>{state.saved.length} saved homes · stored in this browser</p>
        </div>
        <div className="property-grid">
          {all.filter((p) => state.saved.includes(p.id)).map(card)}
        </div>
        {!state.saved.length && (
          <div className="empty">
            <Heart />
            <h2>Your next favorite is out there.</h2>
            <Link className="btn primary" href="/homes">
              Explore homes
            </Link>
          </div>
        )}
      </>
    );
  else if (path === "/dashboard/compare") content = compare();
  else if (path === "/dashboard/assistant")
    content = (
      <>
        <div className="page-heading">
          <span className="eyebrow">A LITTLE GUIDANCE GOES A LONG WAY</span>
          <h1>Let’s make sense of it together.</h1>
          <p>
            Your local demo homebuying guide. No paid API or external service.
          </p>
        </div>
        {assistant()}
      </>
    );
  else if (path === "/dashboard/purchase") content = purchase();
  else if (path === "/dashboard/documents") content = documents();
  else if (path === "/dashboard/messages") content = messages();
  else if (path === "/dashboard/finances") content = finance();
  else if (path === "/dashboard/settings") content = settings();
  else content = publicPage();
  const opsNav = (
    path.startsWith("/admin")
      ? [
          ["Overview", "/admin", LayoutDashboard],
          ["Buyer pipeline", "/admin/leads", Users],
          ["Transactions", "/admin/transactions", Home],
          ["Demo team", "/admin/team", Users],
          ["Analytics", "/admin/analytics", TrendingUp],
          ["Business settings", "/admin/settings", Settings],
        ]
      : [
          ["Overview", "/agent", LayoutDashboard],
          ["Clients", "/agent/clients", Users],
          ["Transactions", "/agent/transactions", Home],
          ["Tasks & deadlines", "/agent/tasks", CheckCircle2],
          ["Messages", "/agent/messages", MessageCircle],
        ]
  ) as typeof buyerNav | ReadonlyArray<readonly [string, string, typeof Home]>;
  const nav = needed === "buyer" ? buyerNav : opsNav;
  return (
    <>
      <div className="demo-ribbon">
        <span>
          <span className="dot" /> A NEW WAY HOME, IN THE MAKING.
        </span>
        <span>
          Explore our interactive concept.{" "}
          <button onClick={() => setModal("demo")}>
            You’re in demo mode <ArrowUpRight size={12} />
          </button>
        </span>
      </div>
      <header className="header">
        <Link className="logo" href="/" aria-label="Homebridge home">
          <svg width="32" height="34" viewBox="0 0 32 34" fill="none">
            <path
              d="M3 29V13L16 3l13 10v16M10 29V18a6 6 0 0 1 12 0v11M3 29h26"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          homebridge<span className="beta">BETA</span>
        </Link>
        <nav
          className={menu ? "public-nav open" : "public-nav"}
          aria-label="Main navigation"
        >
          {[
            ["Explore homes", "/homes"],
            ["How it works", "/how-it-works"],
            ["Pricing", "/pricing"],
            ["Our story", "/about"],
            ["Resources", "/resources"],
          ].map(([n, h]) => (
            <Link
              className={path === h ? "current" : ""}
              key={h}
              href={h}
              onClick={() => setMenu(false)}
            >
              {n}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link
            href={
              state.role
                ? state.role === "buyer"
                  ? "/dashboard"
                  : `/${state.role}`
                : "/login"
            }
            className="sign-in"
          >
            {state.role ? "My workspace" : "Sign in"} <ArrowUpRight size={14} />
          </Link>
          <button
            className="btn primary demo-button"
            onClick={() => setModal("demo")}
          >
            Explore demo <ArrowUpRight size={16} />
          </button>
          <button
            className="mobile-menu"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
        </div>
      </header>
      {workspace ? (
        <div className="workspace">
          <aside className="sidebar">
            <div className="workspace-label">
              {needed === "buyer"
                ? "YOUR HOMEBRIDGE"
                : needed === "agent"
                  ? "AGENT WORKSPACE"
                  : "BROKERAGE WORKSPACE"}
              <span className="badge">DEMO</span>
            </div>
            <nav aria-label="Workspace navigation">
              {nav.map(([title, href, Icon]) => (
                <Link
                  href={href}
                  key={href}
                  className={path === href ? "current" : ""}
                >
                  <Icon size={18} />
                  {title}
                  {title === "Saved homes" && (
                    <span className="count">{state.saved.length}</span>
                  )}
                </Link>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-promo">
                <Sparkles size={19} />
                <h4>
                  A little guidance.
                  <br />
                  Whenever you need it.
                </h4>
                <p>Your next step starts with a question.</p>
                <Link
                  href="/dashboard/assistant"
                  onClick={() => update((s) => ({ ...s, role: "buyer" }))}
                >
                  Ask Homebridge AI <ArrowRight size={14} />
                </Link>
              </div>
              <button
                className="profile-switch"
                onClick={() => setModal("demo")}
              >
                <span className="avatar">
                  {needed === "buyer"
                    ? state.name.slice(0, 1) + "M"
                    : needed === "agent"
                      ? "JE"
                      : "HB"}
                </span>
                <span>
                  <strong>
                    {needed === "buyer"
                      ? state.name + " Morgan"
                      : needed === "agent"
                        ? "Jordan Ellis"
                        : "Homebridge Admin"}
                  </strong>
                  <small>Switch demo role</small>
                </span>
                <ChevronRight size={16} />
              </button>
            </div>
          </aside>
          <main className="workspace-main">
            <div className="workspace-top">
              <span>
                <PanelLeft size={16} /> Your next chapter, organized.
              </span>
              <button
                className="notification"
                aria-label="View notifications"
                onClick={() => setModal("notifications")}
              >
                <Bell size={19} />
                {state.notifications && <i />}
              </button>
            </div>
            {ready ? (
              content
            ) : (
              <div className="loading">Opening your demo workspace…</div>
            )}
          </main>
        </div>
      ) : (
        <main className={path === "/" ? "" : "public-main"}>{content}</main>
      )}
      {state.compare.length > 0 && path !== "/dashboard/compare" && (
        <div className="compare-tray">
          <GitCompareArrows size={18} />
          <span>
            {state.compare.length} home{state.compare.length > 1 ? "s" : ""} to
            compare
          </span>
          <Link
            href="/dashboard/compare"
            className="btn primary"
            onClick={() => update((s) => ({ ...s, role: "buyer" }))}
          >
            Compare <ArrowRight size={15} />
          </Link>
          <button
            aria-label="Clear comparison"
            onClick={() => update((s) => ({ ...s, compare: [] }))}
          >
            <X size={17} />
          </button>
        </div>
      )}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <Link className="logo" href="/">
              <House size={25} />
              homebridge
            </Link>
            <p>A smarter, simpler way home.</p>
          </div>
          <div>
            <Link href="/homes">Explore homes</Link>
            <Link href="/pricing">Transparent pricing</Link>
            <Link href="/sellers">For sellers · Coming soon</Link>
          </div>
          <div>
            <Link href="/about">Our story</Link>
            <Link href="/resources">Buyer resources</Link>
            <Link href="/contact">Get in touch</Link>
          </div>
          <div>
            <span className="eyebrow">THE NEXT CHAPTER IS YOURS.</span>
            <button className="text-link" onClick={() => setModal("demo")}>
              Find your way home <ArrowUpRight size={17} />
            </button>
          </div>
        </div>
        <p className="disclosure">{disclosure}</p>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Homebridge concept. Made for
            possibility.
          </span>
          <span>Local demo · No live listings · No paid APIs</span>
        </div>
      </footer>
      {renderModal()}
      {toast && (
        <div role="status" className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </>
  );
}
