"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, ArrowRight, ArrowLeft, FileText, Download } from "lucide-react";
import { ReviewRequest, OfferDraft } from "../../lib/homebridge/schema";
import { dollars } from "../../lib/homebridge/finance";
import { documentSections } from "../../lib/homebridge/documents";
import { useWorkspace, postJson } from "./workspace-provider";
import { ReviewComments, ReviewTimeline, reviewLabels } from "./review";
export default function AgentWorkspace() {
  const { state, update, ready, notify } = useWorkspace();
  const params = useSearchParams();
  const [selected, setSelected] = useState(params.get("review") || "");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const review =
    state.reviews.find((r) => r.id === selected) || state.reviews[0];
  if (!ready)
    return (
      <div className="hb-page hb-skeleton">
        <div />
        <div />
      </div>
    );
  if (state.role !== "demo-agent")
    return (
      <div className="hb-page hb-review-entry hb-panel">
        <span className="hb-ai-symbol">
          <Users size={26} />
        </span>
        <span className="hb-eyebrow">LOCAL ROLE SIMULATION</span>
        <h1>Explore the reviewer’s side.</h1>
        <p>
          This is a demo of professional review, using only this workspace’s
          shared snapshots. It does not sign you in as an agent or verify any
          professional credentials.
        </p>
        <button
          className="hb-btn hb-primary"
          onClick={() => update((s) => ({ ...s, role: "demo-agent" }))}
        >
          Enter demo reviewer simulation <ArrowRight size={16} />
        </button>
        <Link href="/purchase" className="hb-btn hb-quiet">
          Return to buyer workspace
        </Link>
      </div>
    );
  function change(status: ReviewRequest["status"]) {
    if (!review) return;
    if (
      (status === "changes_requested" || status === "next_steps") &&
      !comment.trim()
    ) {
      notify(
        "Add a comment explaining the requested changes or next steps first.",
      );
      return;
    }
    const now = new Date().toISOString();
    update((s) => ({
      ...s,
      reviews: s.reviews.map((r) =>
        r.id === review.id
          ? {
              ...r,
              status,
              comments: comment.trim()
                ? [
                    ...r.comments,
                    {
                      id: crypto.randomUUID(),
                      author: "Demo reviewer",
                      text: comment.trim(),
                      time: now,
                    },
                  ]
                : r.comments,
              history: [...r.history, { status, time: now }],
            }
          : r,
      ),
    }));
    setComment("");
    notify(
      "Simulated review status updated. No actual professional approval occurred.",
    );
  }
  async function download() {
    if (!review) return;
    setBusy(true);
    try {
      const draft: OfferDraft = {
        id: review.offerId,
        propertyId: review.propertyId,
        terms: review.terms,
        revision: review.revision,
        step: 11,
        generatedRevision: review.revision,
        createdAt: review.sharedAt,
        updatedAt: review.sharedAt,
      };
      const r = await postJson("/api/pdf", {
        property: review.property,
        draft,
        profile: review.profile,
        assumptions: review.assumptions,
        section: "all",
      });
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `homebridge-shared-review-r${review.revision}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="hb-page">
      <div className="hb-page-heading hb-row hb-between">
        <div>
          <span className="hb-eyebrow">
            PROFESSIONAL HANDOFF · PROTOTYPE SIMULATION
          </span>
          <h1>Demo review workspace</h1>
          <p>
            Read the buyer-approved snapshot, ask for revisions, and show the
            next step. Nothing here approves a real contract.
          </p>
        </div>
        <Link
          href="/purchase"
          className="hb-btn hb-outline"
          onClick={() => update((s) => ({ ...s, role: "buyer" }))}
        >
          <ArrowLeft size={15} />
          Back to buyer
        </Link>
      </div>
      <div className="hb-review-queue">
        <aside className="hb-panel">
          <h2>
            Review requests <span>{state.reviews.length}</span>
          </h2>
          {!state.reviews.length && (
            <p>No buyer has approved a shared draft yet.</p>
          )}
          {state.reviews.map((r) => (
            <button
              className={review?.id === r.id ? "active" : ""}
              key={r.id}
              onClick={() => {
                setSelected(r.id);
                setComment("");
              }}
            >
              <strong>{r.property.address}</strong>
              <span>
                Revision {r.revision} · {reviewLabels[r.status]}
              </span>
              <small>{new Date(r.sharedAt).toLocaleString()}</small>
            </button>
          ))}
        </aside>
        {review ? (
          <div>
            <section className="hb-panel">
              <div className="hb-row hb-between">
                <span className="hb-status">{reviewLabels[review.status]}</span>
                <span className="hb-demo-pill">NO REAL AGENT ASSIGNED</span>
              </div>
              <h2>{review.property.address}</h2>
              <p>
                Fixed snapshot · shared revision {review.revision}. Only the
                sections approved by the buyer are present.
              </p>
              <div className="hb-review-summary">
                <div>
                  <span>Proposed price</span>
                  <strong>{dollars(review.terms.amount)}</strong>
                </div>
                <div>
                  <span>Financing</span>
                  <strong>{review.terms.financing}</strong>
                </div>
                <div>
                  <span>Earnest money</span>
                  <strong>{dollars(review.terms.earnest)}</strong>
                </div>
                <div>
                  <span>Closing target</span>
                  <strong>{review.terms.closingDate || "Not provided"}</strong>
                </div>
              </div>
              <details className="hb-details">
                <summary>Buyer preferences & property analysis</summary>
                <p>
                  Monthly comfort budget:{" "}
                  {dollars(review.profile.monthlyBudget)} · Yard:{" "}
                  {review.profile.yard} · Preapproval:{" "}
                  {review.profile.preapproved}
                </p>
                {review.analysis.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </details>
              <details className="hb-details">
                <summary>All shared terms & six-document package</summary>
                {documentSections(
                  review.property,
                  {
                    id: review.offerId,
                    propertyId: review.propertyId,
                    terms: review.terms,
                    revision: review.revision,
                    step: 11,
                    generatedRevision: review.revision,
                    createdAt: review.sharedAt,
                    updatedAt: review.sharedAt,
                  },
                  review.profile,
                  review.assumptions,
                ).map((section) => (
                  <details key={section.id} className="hb-details">
                    <summary>{section.title}</summary>
                    {section.lines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </details>
                ))}
              </details>
              <button
                className="hb-btn hb-outline hb-small"
                disabled={busy}
                onClick={() => void download()}
              >
                <Download size={14} />
                Download shared draft snapshot
              </button>
              <div className="hb-review-controls">
                <label>
                  Reviewer comment / requested changes
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={2000}
                    placeholder="Explain what the buyer should change or investigate…"
                  />
                </label>
                <div className="hb-row">
                  <button
                    className="hb-btn hb-outline hb-small"
                    onClick={() => change("reviewing")}
                  >
                    Start simulated review
                  </button>
                  <button
                    className="hb-btn hb-outline hb-small"
                    onClick={() => change("changes_requested")}
                  >
                    Request changes
                  </button>
                  <button
                    className="hb-btn hb-primary hb-small"
                    onClick={() => change("review_complete")}
                  >
                    Mark simulated review complete
                  </button>
                  <button
                    className="hb-btn hb-quiet hb-small"
                    onClick={() => change("next_steps")}
                  >
                    Provide next steps
                  </button>
                </div>
              </div>
            </section>
            <div className="hb-review-grid">
              <section className="hb-panel">
                <h3>Status history</h3>
                <ReviewTimeline review={review} />
              </section>
              <section className="hb-panel">
                <ReviewComments key={review.id} review={review} asAgent />
              </section>
            </div>
          </div>
        ) : (
          <div className="hb-empty hb-panel">
            <FileText size={30} />
            <h2>Prepare a buyer draft to try the handoff.</h2>
            <Link href="/homes?demo=1" className="hb-btn hb-primary">
              Choose a demo home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
