"use client";
import { invalidateDocuments } from "../../lib/homebridge/workflow";
import { Home, BuyerProfile } from "../../lib/homebridge/schema";
import { useWorkspace } from "./workspace-provider";
export default function BuyerProfileForm({ home }: { home: Home }) {
  const { state, profileFor, update } = useWorkspace();
  const p = profileFor(home.id);
  function patch(values: Partial<BuyerProfile>) {
    const next = { ...p, ...values };
    update((s) => ({
      ...s,
      offers: invalidateDocuments(
        s,
        next.remember ? Object.keys(s.offers) : [home.id],
      ),
      profile: next.remember ? next : { ...s.profile, remember: false },
      propertyProfiles: { ...s.propertyProfiles, [home.id]: next },
    }));
  }
  return (
    <section className="hb-panel">
      <span className="hb-eyebrow">YOUR PRIORITIES, AT YOUR PACE</span>
      <h2>What matters to you?</h2>
      <p>
        Optional answers personalize the analysis. No loan application or
        account is required.
      </p>
      <div className="hb-form-grid">
        <label>
          Comfortable monthly housing budget ($)
          <input
            type="number"
            min="1"
            max="100000"
            value={p.monthlyBudget ?? ""}
            onChange={(e) =>
              patch({
                monthlyBudget: e.target.value
                  ? Math.min(100000, Math.max(0, Number(e.target.value)))
                  : null,
              })
            }
          />
        </label>
        <label>
          Minimum bedrooms
          <input
            type="number"
            min="0"
            max="20"
            value={p.minBeds ?? ""}
            onChange={(e) =>
              patch({
                minBeds: e.target.value
                  ? Math.min(20, Math.max(0, Number(e.target.value)))
                  : null,
              })
            }
          />
        </label>
        <label>
          Preferred locations
          <input
            value={p.locations}
            maxLength={200}
            onChange={(e) => patch({ locations: e.target.value })}
          />
        </label>
        {(
          [
            [
              "firstHome",
              "Is this your first home?",
              ["Not shared", "Yes", "No"],
            ],
            [
              "yard",
              "How important is a yard?",
              ["Not shared", "Important", "Nice to have", "Not needed"],
            ],
            [
              "stay",
              "How long might you stay?",
              ["Not sure", "Under 5 years", "5+ years"],
            ],
            [
              "preapproved",
              "Mortgage preapproval",
              ["Not shared", "Yes", "No", "In progress"],
            ],
          ] as const
        ).map(([key, label, options]) => (
          <label key={key}>
            {label}
            <select
              value={p[key]}
              onChange={(e) => patch({ [key]: e.target.value })}
            >
              {options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <label className="hb-checkbox">
        <input
          type="checkbox"
          checked={state.profile.remember}
          onChange={(e) => patch({ remember: e.target.checked })}
        />
        <span>
          Use these preferences across homes. I can edit or turn this off
          anytime.
        </span>
      </label>
      <span className="hb-autosave">
        Saved{" "}
        {state.profile.remember ? "across your workspace" : "for this property"}{" "}
        ·{" "}
        {state.profile.remember
          ? "with your permission"
          : "no cross-property memory enabled"}
      </span>
    </section>
  );
}
