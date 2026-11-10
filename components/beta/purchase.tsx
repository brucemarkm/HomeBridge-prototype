"use client";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MessageCircle,
  Users,
  CalendarDays,
} from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import { missingTerms } from "../../lib/homebridge/analysis";
import { dollars } from "../../lib/homebridge/finance";
import { reviewLabels, ReviewTimeline, ReviewComments } from "./review";
export default function Purchase() {
  const { state, all, update, ready } = useWorkspace();
  const draft =
    state.offers[state.activeHome] || Object.values(state.offers)[0];
  const home = all.find(
    (h) => h.id === (draft?.propertyId || state.activeHome),
  );
  const review = draft
    ? state.reviews.find((r) => r.offerId === draft.id)
    : undefined;
  const step = review
    ? review.status === "changes_requested"
      ? 3
      : 4
    : draft?.generatedRevision
      ? 3
      : draft
        ? 2
        : 0;
  const next =
    review?.status === "changes_requested"
      ? "Read the reviewer’s comments and update your proposed terms."
      : review
        ? "Follow your review status and resolve outstanding questions."
        : draft?.generatedRevision
          ? "Preview your documents and approve what you share."
          : draft
            ? "Confirm your remaining proposed terms."
            : "Choose a home to begin.";
  if (!ready)
    return (
      <div className="hb-page hb-skeleton">
        <div />
        <div />
      </div>
    );
  return (
    <div className="hb-page hb-purchase-page">
      <div className="hb-page-heading">
        <span className="hb-eyebrow">ONE CLEAR NEXT STEP</span>
        <h1>My Purchase</h1>
        <p>
          Your preparation, documents, and simulated professional review —
          together.
        </p>
      </div>
      {!draft || !home ? (
        <div className="hb-empty hb-panel">
          <ClipboardCheck size={30} />
          <h2>Your purchase starts with a home.</h2>
          <p>
            You don’t need an account, preapproval, or a completed form to try
            the demo.
          </p>
          <Link className="hb-btn hb-primary" href="/homes?demo=1">
            Try a demo purchase <ArrowRight size={16} />
          </Link>
          <Link href="/import" className="hb-btn hb-outline">
            Bring a listing link
          </Link>
        </div>
      ) : (
        <>
          <label className="hb-purchase-selector">
            Active preparation
            <select
              value={home.id}
              onChange={(e) =>
                update((s) => ({ ...s, activeHome: e.target.value }))
              }
            >
              {Object.values(state.offers).map((o) => (
                <option key={o.id} value={o.propertyId}>
                  {all.find((h) => h.id === o.propertyId)?.address ||
                    "Saved property"}
                </option>
              ))}
            </select>
          </label>
          <section className="hb-purchase-current">
            <div>
              <span className="hb-status">
                {review
                  ? reviewLabels[review.status]
                  : draft.generatedRevision
                    ? "Draft package prepared"
                    : "Draft terms in progress"}
              </span>
              <h2>{home.address}</h2>
              <p>
                {home.city} · Proposed price {dollars(draft.terms.amount)} ·
                Draft revision {draft.revision}
              </p>
            </div>
            <Link href={`/homes/${home.id}`} className="hb-btn hb-outline">
              Open property <ArrowRight size={15} />
            </Link>
          </section>
          <div className="hb-purchase-progress">
            {[
              "Home selected",
              "Analysis & priorities",
              "Proposed terms",
              "Draft documents",
              "Review & next steps",
            ].map((label, i) => (
              <div key={label} className={i <= step ? "complete" : ""}>
                <span>{i < step ? <CheckCircle2 size={16} /> : i + 1}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
          <section className="hb-next-action">
            <span className="hb-eyebrow">YOUR NEXT ACTION</span>
            <h2>{next}</h2>
            <Link
              href={`/homes/${home.id}?tab=${review?.status === "changes_requested" ? "offer" : review ? "review" : draft.generatedRevision ? "documents" : "offer"}`}
              className="hb-btn hb-primary"
            >
              {review?.status === "changes_requested"
                ? "Update draft terms"
                : review
                  ? "Open agent review"
                  : draft.generatedRevision
                    ? "Review draft package"
                    : "Continue preparation"}
              <ArrowRight size={16} />
            </Link>
          </section>
          <div className="hb-purchase-panels">
            <section className="hb-panel">
              <h3>
                <FileText size={19} />
                Your documents
              </h3>
              <p>
                Six original preparation worksheets. Not purchase agreements.
              </p>
              <p>
                {missingTerms(draft.terms).length} unanswered preparation
                questions.
              </p>
              <Link
                href={`/homes/${home.id}?tab=documents`}
                className="hb-text-link"
              >
                Preview and download <ArrowRight size={14} />
              </Link>
            </section>
            <section className="hb-panel">
              <h3>
                <CalendarDays size={19} />
                Planning dates
              </h3>
              <p>
                Desired closing:{" "}
                <strong>{draft.terms.closingDate || "Not selected"}</strong>
              </p>
              <p>
                No contractual deadlines have been established. Discuss timing
                and contingencies with a licensed professional.
              </p>
            </section>
            <section className="hb-panel">
              <h3>
                <ClipboardCheck size={19} />
                Personal checklist
              </h3>
              {[
                "Review payment assumptions",
                "Read supplied disclosures",
                "List questions for inspection",
              ].map((t) => (
                <label className="hb-checkbox" key={t}>
                  <input
                    type="checkbox"
                    checked={state.completedTasks.includes(`${home.id}:${t}`)}
                    onChange={(e) =>
                      update((s) => ({
                        ...s,
                        completedTasks: e.target.checked
                          ? [...s.completedTasks, `${home.id}:${t}`]
                          : s.completedTasks.filter(
                              (x) => x !== `${home.id}:${t}`,
                            ),
                      }))
                    }
                  />
                  {t}
                </label>
              ))}
            </section>
          </div>
          {review && (
            <div className="hb-review-grid">
              <section className="hb-panel">
                <h3>
                  <Users size={19} />
                  Review progress
                </h3>
                <ReviewTimeline review={review} />
                <Link
                  href={`/agent?review=${review.id}`}
                  className="hb-text-link"
                >
                  Simulate agent review <ArrowRight size={14} />
                </Link>
              </section>
              <section className="hb-panel">
                <h3>
                  <MessageCircle size={19} />
                  Messages
                </h3>
                <ReviewComments key={review.id} review={review} />
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
