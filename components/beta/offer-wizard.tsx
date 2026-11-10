"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check, FileText, Sparkles } from "lucide-react";
import {
  Home,
  OfferDraft,
  OfferTerms,
  termsSchema,
} from "../../lib/homebridge/schema";
import { offerQuestions, missingTerms } from "../../lib/homebridge/analysis";
import { dollars } from "../../lib/homebridge/finance";
import { useWorkspace } from "./workspace-provider";
function Question({
  draft,
  save,
  back,
}: {
  draft: OfferDraft;
  save: (value: string, skip?: boolean) => void;
  back: () => void;
}) {
  const q = offerQuestions[draft.step],
    existing = draft.terms[q.key];
  const [value, setValue] = useState(existing === null ? "" : String(existing));
  return (
    <form
      className="hb-offer-question"
      onSubmit={(e) => {
        e.preventDefault();
        save(value);
      }}
    >
      <span className="hb-eyebrow">
        QUESTION {draft.step + 1} OF {offerQuestions.length}
      </span>
      <h2>{q.title}</h2>
      <p>{q.help}</p>
      <label>
        {q.kind === "select" ? (
          <select
            aria-label={q.title}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          >
            {q.options?.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : q.kind === "text" ? (
          <textarea
            aria-label={q.title}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={q.key === "notes" ? 2000 : 1000}
            placeholder="Your preferences or questions for the agent…"
          />
        ) : (
          <input
            aria-label={q.title}
            type={q.kind === "date" ? "date" : "number"}
            min="0"
            max={q.kind === "percent" ? 100 : 100000000}
            step={q.kind === "percent" ? ".5" : "1"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              q.kind === "money"
                ? "Enter amount in dollars"
                : "Enter percentage"
            }
          />
        )}
      </label>
      <div className="hb-row hb-between">
        <button className="hb-btn hb-quiet" type="button" onClick={back}>
          <ArrowLeft size={15} />
          Back
        </button>
        <button
          className="hb-btn hb-quiet"
          type="button"
          onClick={() => save("", true)}
        >
          Skip for now
        </button>
        <button className="hb-btn hb-primary">
          Confirm draft answer <Check size={15} />
        </button>
      </div>
    </form>
  );
}
export default function OfferWizard({ home }: { home: Home }) {
  const { state, update, notify } = useWorkspace();
  const router = useRouter();
  const draft = state.offers[home.id];
  function start() {
    const now = new Date().toISOString();
    update((s) => ({
      ...s,
      activeHome: home.id,
      offers: {
        ...s.offers,
        [home.id]: {
          id: crypto.randomUUID(),
          propertyId: home.id,
          terms: termsSchema.parse({}),
          revision: 1,
          step: 0,
          generatedRevision: null,
          createdAt: now,
          updatedAt: now,
        },
      },
      saved: s.saved.includes(home.id) ? s.saved : [...s.saved, home.id],
    }));
  }
  function patch(changes: Partial<OfferDraft>) {
    update((s) => ({
      ...s,
      activeHome: home.id,
      offers: {
        ...s.offers,
        [home.id]: {
          ...draft,
          ...changes,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  }
  function save(value: string, skip = false) {
    if (skip) {
      patch({
        step: draft.editing ? offerQuestions.length : draft.step + 1,
        editing: false,
      });
      return;
    }
    const q = offerQuestions[draft.step];
    const raw =
      q.kind === "money" || q.kind === "percent"
        ? value === ""
          ? null
          : Number(value)
        : value;
    const next = termsSchema.safeParse({ ...draft.terms, [q.key]: raw });
    if (!next.success) {
      notify("Please check this answer before confirming it.");
      return;
    }
    patch({
      terms: next.data,
      revision: draft.revision + 1,
      step: draft.editing ? offerQuestions.length : draft.step + 1,
      editing: false,
    });
    notify("Draft answer confirmed and saved. No offer has been submitted.");
  }
  if (!draft)
    return (
      <section className="hb-offer-intro hb-panel">
        <span className="hb-ai-symbol">
          <Sparkles size={23} />
        </span>
        <span className="hb-eyebrow">
          PREPARE FIRST. DECIDE WITH A PROFESSIONAL.
        </span>
        <h2>Let’s prepare your proposed offer.</h2>
        <p>
          We’ll work through one decision at a time. You can skip anything you
          don’t know and return later. A licensed professional must review
          everything before any actual offer.
        </p>
        <div className="hb-offer-promise">
          <Check size={16} />
          You confirm every term. The advisor never changes answers for you.
        </div>
        <button className="hb-btn hb-primary" onClick={start}>
          Start draft preparation <ArrowRight size={16} />
        </button>
        <small>
          This creates a nonbinding worksheet, not a purchase agreement.
        </small>
      </section>
    );
  return (
    <section className="hb-panel hb-offer-panel">
      <div className="hb-row hb-between">
        <span className="hb-demo-pill">
          NONBINDING DRAFT · REVISION {draft.revision}
        </span>
        <span className="hb-autosave">Saved in your workspace</span>
      </div>
      <div className="hb-wizard-progress">
        <i
          style={{
            width: `${Math.min(draft.step / offerQuestions.length, 1) * 100}%`,
          }}
        />
      </div>
      {draft.step < offerQuestions.length ? (
        <Question
          key={`${draft.id}-${draft.step}`}
          draft={draft}
          save={save}
          back={() =>
            patch({
              step: draft.editing
                ? offerQuestions.length
                : Math.max(0, draft.step - 1),
              editing: false,
            })
          }
        />
      ) : (
        <>
          <span className="hb-eyebrow">REVIEW YOUR PROPOSED TERMS</span>
          <h2>Your answers. Ready to organize.</h2>
          <p>
            {missingTerms(draft.terms).length
              ? `${missingTerms(draft.terms).length} answers are still missing. You can generate a draft with missing information clearly marked.`
              : "All preparation questions have an answer. These terms still require professional review."}
          </p>
          <div className="hb-terms-summary">
            {offerQuestions.map((q, i) => (
              <div key={q.key}>
                <span>{q.title}</span>
                <strong>
                  {draft.terms[q.key] === null || draft.terms[q.key] === ""
                    ? "Not provided"
                    : q.kind === "money"
                      ? dollars(Number(draft.terms[q.key]))
                      : String(draft.terms[q.key]) +
                        (q.kind === "percent" ? "%" : "")}
                </strong>
                <button
                  onClick={() => patch({ step: i, editing: true })}
                  aria-label={`Edit ${q.key}`}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
          <div className="hb-callout">
            <FileText size={21} />
            <p>
              All generated documents are original informational worksheets
              labeled “DEMO DRAFT — NOT A VALID PURCHASE AGREEMENT — NOT FOR
              SUBMISSION.” They are not official Utah forms.
            </p>
          </div>
          <button
            className="hb-btn hb-primary"
            onClick={() => {
              patch({ generatedRevision: draft.revision });
              router.push(`/homes/${home.id}?tab=documents`);
              notify(
                "Draft package created. Preview and download it before requesting review.",
              );
            }}
          >
            Create draft package <FileText size={16} />
          </button>
        </>
      )}
    </section>
  );
}
