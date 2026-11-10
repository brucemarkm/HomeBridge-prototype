"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  RefreshCw,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { Home } from "../../lib/homebridge/schema";
import { documentSections, DRAFT_NOTICE } from "../../lib/homebridge/documents";
import { defaultAssumptions } from "../../lib/homebridge/finance";
import { useWorkspace, postJson } from "./workspace-provider";
export default function DraftDocuments({ home }: { home: Home }) {
  const { state, update, notify, profileFor } = useWorkspace();
  const [selected, setSelected] = useState("summary");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const draft = state.offers[home.id];
  if (!draft || draft.generatedRevision === null)
    return (
      <div className="hb-empty hb-panel">
        <FileText size={30} />
        <h2>Prepare your terms first.</h2>
        <p>
          Your draft package will include an offer summary, terms worksheet,
          financial assumptions, due-diligence questions, timeline, and review
          checklist.
        </p>
        <Link
          className="hb-btn hb-primary"
          href={`/homes/${home.id}?tab=offer`}
        >
          Prepare an offer <ArrowRight size={16} />
        </Link>
      </div>
    );
  const assumptions = state.assumptions[home.id] || defaultAssumptions(home),
    profile = profileFor(home.id);
  const sections = documentSections(home, draft, profile, assumptions);
  const active = sections.find((s) => s.id === selected) || sections[0];
  const stale = draft.generatedRevision !== draft.revision;
  async function download(section: string) {
    setBusy(true);
    setError("");
    try {
      const response = await postJson("/api/pdf", {
        property: home,
        draft,
        profile,
        assumptions,
        section,
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `homebridge-${section}-draft-r${draft.revision}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("Draft PDF downloaded. It is not a valid purchase agreement.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="hb-documents">
      <div className="hb-section-heading">
        <div>
          <span className="hb-eyebrow">YOUR PREPARATION PACKAGE</span>
          <h2>Review the details before sharing.</h2>
        </div>
        <button
          className="hb-btn hb-primary"
          disabled={busy || stale}
          onClick={() => void download("all")}
        >
          {busy ? (
            <LoaderCircle size={15} className="hb-spin" />
          ) : (
            <Download size={15} />
          )}
          Download PDF package
        </button>
      </div>
      {stale && (
        <div className="hb-callout">
          <RefreshCw size={18} />
          <div>
            <strong>Your terms have changed.</strong>
            <p>
              The preview below reflects your current answers. Regenerate to
              create a current package before downloading or requesting review.
            </p>
            <button
              className="hb-btn hb-outline hb-small"
              onClick={() => {
                update((s) => ({
                  ...s,
                  offers: {
                    ...s.offers,
                    [home.id]: { ...draft, generatedRevision: draft.revision },
                  },
                }));
                notify(
                  "Draft package regenerated from your confirmed answers.",
                );
              }}
            >
              Regenerate draft
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="hb-error" role="alert">
          {error}
        </div>
      )}
      <div className="hb-document-workspace">
        <nav aria-label="Draft documents">
          {sections.map((section) => (
            <button
              className={selected === section.id ? "active" : ""}
              key={section.id}
              onClick={() => setSelected(section.id)}
            >
              <FileText size={16} />
              {section.title}
            </button>
          ))}
        </nav>
        <article className="hb-document-paper">
          <div className="hb-document-brand">
            homebridge<span>DRAFT PREPARATION</span>
          </div>
          <div className="hb-document-warning">{DRAFT_NOTICE}</div>
          <h3>{active.title}</h3>
          <p className="hb-document-meta">
            {home.address} · Revision {draft.revision}
          </p>
          {active.lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          <div className="hb-document-signoff">
            No signatures. No actual submission. Professional review required.
          </div>
        </article>
      </div>
      <div className="hb-row hb-between hb-document-actions">
        <button
          className="hb-btn hb-outline"
          disabled={busy || stale}
          onClick={() => void download(selected)}
        >
          <Download size={15} />
          Download this document
        </button>
        <Link href={`/homes/${home.id}?tab=offer`} className="hb-text-link">
          Edit answers
        </Link>
        <Link
          href={`/homes/${home.id}?tab=review`}
          className="hb-btn hb-primary"
        >
          Review sharing details <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
