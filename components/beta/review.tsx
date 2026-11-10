"use client";
import { useState } from "react";
import Link from "next/link";
import { Home, ReviewRequest, OfferDraft } from "../../lib/homebridge/schema";
import { analyze } from "../../lib/homebridge/analysis";
import { defaultAssumptions, dollars } from "../../lib/homebridge/finance";
import { documentSections } from "../../lib/homebridge/documents";
import { useWorkspace } from "./workspace-provider";
import {
  ArrowRight,
  Users,
  Check,
  Send,
  ClipboardCheck,
  FileText,
} from "lucide-react";
export const reviewLabels: Record<ReviewRequest["status"], string> = {
  requested: "Review requested",
  reviewing: "Demo reviewer is reviewing",
  changes_requested: "Changes requested",
  review_complete: "Simulated review complete",
  next_steps: "Next steps provided",
};
export function ReviewTimeline({ review }: { review: ReviewRequest }) {
  return (
    <div className="hb-review-history">
      {[
        { status: "Draft prepared", time: review.sharedAt },
        ...review.history.map((h) => ({
          status: reviewLabels[h.status as ReviewRequest["status"]] || h.status,
          time: h.time,
        })),
      ].map((event, i) => (
        <div key={i}>
          <span>
            <Check size={12} />
          </span>
          <div>
            <strong>{event.status}</strong>
            <small>{new Date(event.time).toLocaleString()}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
export function ReviewComments({
  review,
  asAgent = false,
}: {
  review: ReviewRequest;
  asAgent?: boolean;
}) {
  const { update, notify } = useWorkspace();
  const [text, setText] = useState("");
  return (
    <div className="hb-review-comments">
      <h3>Questions & review comments</h3>
      {!review.comments.length && (
        <p>No comments yet. Add a question or open the reviewer simulation.</p>
      )}
      {review.comments.map((c) => (
        <div
          className={`hb-review-comment ${c.author === "Buyer" ? "buyer" : ""}`}
          key={c.id}
        >
          <small>
            {c.author} · {new Date(c.time).toLocaleString()}
          </small>
          <p>{c.text}</p>
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          update((s) => ({
            ...s,
            reviews: s.reviews.map((r) =>
              r.id === review.id
                ? {
                    ...r,
                    comments: [
                      ...r.comments,
                      {
                        id: crypto.randomUUID(),
                        author: asAgent ? "Demo reviewer" : "Buyer",
                        text: text.trim(),
                        time: new Date().toISOString(),
                      },
                    ],
                  }
                : r,
            ),
          }));
          setText("");
          notify(
            "Comment saved to the simulated review. No message was sent outside this workspace.",
          );
        }}
      >
        <label>
          {asAgent ? "Comment for the buyer" : "Question for the demo reviewer"}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            required
          />
        </label>
        <button className="hb-btn hb-outline hb-small">
          <Send size={14} />
          Add comment
        </button>
      </form>
    </div>
  );
}
export default function AgentHandoff({ home }: { home: Home }) {
  const { state, update, profileFor, notify } = useWorkspace();
  const [approved, setApproved] = useState(false);
  const draft = state.offers[home.id];
  const review = state.reviews.find((r) => r.propertyId === home.id);
  const a = state.assumptions[home.id] || defaultAssumptions(home),
    profile = profileFor(home.id);
  if (!draft || draft.generatedRevision === null)
    return (
      <div className="hb-empty hb-panel">
        <Users size={30} />
        <h2>Prepare a draft before requesting review.</h2>
        <p>
          You’ll choose what to share before anything enters the demo review
          workspace.
        </p>
        <Link
          href={`/homes/${home.id}?tab=offer`}
          className="hb-btn hb-primary"
        >
          Prepare an offer <ArrowRight size={15} />
        </Link>
      </div>
    );
  const stale = draft.generatedRevision !== draft.revision;
  const already = review?.revision === draft.revision;
  const snapshot = analyze(home, profile, a).map(
    (o) => `${o.title}: ${o.text}`,
  );
  function request() {
    if (!approved || stale || already) return;
    const now = new Date().toISOString();
    const newReview: ReviewRequest = {
      property: structuredClone(home),
      id: crypto.randomUUID(),
      propertyId: home.id,
      offerId: draft.id,
      revision: draft.revision,
      status: "requested",
      sharedAt: now,
      terms: structuredClone(draft.terms),
      profile: structuredClone(profile),
      assumptions: structuredClone(a),
      analysis: snapshot,
      comments: [],
      history: [{ status: "requested", time: now }],
      sharedSections: [
        "Property information",
        "Relevant buyer preferences",
        "Proposed terms",
        "Grounded analysis",
        "Six draft preparation documents",
        "Questions and missing information",
      ],
    };
    update((s) => ({
      ...s,
      reviews: [newReview, ...s.reviews],
      activeHome: home.id,
    }));
    setApproved(false);
    notify(
      "Simulated review requested. No real agent or seller was contacted.",
    );
  }
  return (
    <section>
      <div className="hb-section-heading">
        <div>
          <span className="hb-eyebrow">YOU CONTROL THE HANDOFF</span>
          <h2>
            {already
              ? "Your simulated review"
              : "Your draft is ready for professional review."}
          </h2>
          <p>
            In this prototype, review stays inside your workspace and is
            performed through a clearly labeled simulation.
          </p>
        </div>
        <span className="hb-demo-pill">SIMULATION ONLY</span>
      </div>
      {review && (
        <div className="hb-review-grid">
          <section className="hb-panel">
            <span className="hb-status">{reviewLabels[review.status]}</span>
            <p>
              Shared revision {review.revision} ·{" "}
              {review.revision === draft.revision
                ? "Matches your current terms"
                : "Your current terms have changed since this snapshot."}
            </p>
            <ReviewTimeline review={review} />
            <Link
              href={`/agent?review=${review.id}`}
              className="hb-btn hb-outline"
            >
              <Users size={15} />
              Simulate agent review
            </Link>
          </section>
          <section className="hb-panel">
            <ReviewComments review={review} />
          </section>
        </div>
      )}
      {!already && (
        <section className="hb-panel hb-share-panel">
          <h3>Exactly what you’re sharing</h3>
          <p>
            This snapshot is fixed when you confirm. Later edits do not silently
            change a review request.
          </p>
          <details open className="hb-details">
            <summary>Property and original source</summary>
            <p>
              {home.address}, {home.city} · {dollars(home.price)}
              <br />
              {home.sourceUrl || "Fictional demo property; no live listing URL"}
            </p>
          </details>
          <details className="hb-details">
            <summary>Relevant buyer preferences and proposed terms</summary>
            <p>
              Monthly comfort budget: {dollars(profile.monthlyBudget)} · Yard:{" "}
              {profile.yard} · Preapproval: {profile.preapproved}
            </p>
            <p>
              Proposed price: {dollars(draft.terms.amount)} · Financing:{" "}
              {draft.terms.financing} · Earnest money:{" "}
              {dollars(draft.terms.earnest)}
            </p>
            <Link href={`/homes/${home.id}?tab=offer`} className="hb-text-link">
              Review all proposed terms
            </Link>
          </details>
          <details className="hb-details">
            <summary>Analysis, questions, and document package</summary>
            {snapshot.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            {documentSections(home, draft, profile, a).map((d) => (
              <p key={d.id}>
                <FileText size={12} /> {d.title}
              </p>
            ))}
          </details>
          {stale && (
            <div className="hb-error">
              Regenerate your documents after editing terms before requesting
              review.{" "}
              <Link href={`/homes/${home.id}?tab=documents`}>
                Open documents
              </Link>
            </div>
          )}
          <label className="hb-checkbox">
            <input
              type="checkbox"
              checked={approved}
              onChange={(e) => setApproved(e.target.checked)}
            />
            <span>
              I approve sharing the displayed property, preferences, terms,
              analysis, questions, and six-document draft package in this local
              review simulation. No real professional is contacted.
            </span>
          </label>
          <button
            className="hb-btn hb-primary"
            disabled={!approved || stale}
            onClick={request}
          >
            Request agent review <ArrowRight size={16} />
          </button>
        </section>
      )}
    </section>
  );
}
