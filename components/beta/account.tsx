"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Cloud,
  UserRound,
  Mail,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Download,
} from "lucide-react";
import { browserAuth } from "../../lib/homebridge/auth-client";
import { workspaceSchema } from "../../lib/homebridge/schema";
import { loadWorkspace, GUEST_KEY } from "../../lib/homebridge/storage";
import { useWorkspace } from "./workspace-provider";
export default function Account() {
  const { state, update, config, refreshConfig, notify, reset } =
    useWorkspace();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    params.get("error") ? "Sign-in did not complete. Please try again." : "",
  );
  const [resetConfirm, setResetConfirm] = useState(false);
  const [syncConfirm, setSyncConfirm] = useState(false);
  async function signIn(google = false) {
    const auth = browserAuth();
    if (!auth) {
      setError(
        "Authentication is not configured. Continue using the guest demo.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = google
        ? await auth.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: location.origin + "/auth/callback" },
          })
        : await auth.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: location.origin + "/auth/callback" },
          });
      if (result.error) throw result.error;
      if (!google)
        notify(
          "A real sign-in email was requested. Check your inbox; delivery depends on your authentication provider.",
        );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function sync(load = false) {
    if (!syncConfirm) {
      setError(
        "Confirm that you understand this will replace the selected workspace copy.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/workspace", {
        method: load ? "GET" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Homebridge-Request": "1",
        },
        body: load ? undefined : JSON.stringify(state),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      if (load) {
        if (!data.state) {
          notify("No cloud copy exists yet. Save your workspace first.");
          return;
        }
        const parsed = workspaceSchema.parse(data.state);
        update(() => ({ ...parsed, role: "buyer" }));
        notify("Your authenticated cloud workspace was loaded.");
      } else notify("Your workspace was saved to your private account.");
      setSyncConfirm(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="hb-page hb-account-page">
      <div className="hb-page-heading">
        <span className="hb-eyebrow">
          EXPLORE FIRST. SIGN IN WHEN IT HELPS.
        </span>
        <h1>
          {config.user ? "Your account" : "Your workspace, at your pace."}
        </h1>
        <p>
          Browsing, imports, analysis, draft PDFs, and review simulation all
          work as a guest.
        </p>
      </div>
      <div className="hb-account-grid">
        <section className="hb-panel">
          <span className="hb-ai-symbol">
            <UserRound size={23} />
          </span>
          <h2>{config.user ? "Signed in" : "Guest demo"}</h2>
          {config.user ? (
            <>
              <p>{config.user.email}</p>
              <p>
                Your account has its own browser storage and private,
                owner-authorized cloud sync. Guest work is not attached
                automatically.
              </p>
              <button
                className="hb-btn hb-outline"
                disabled={busy}
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Sign out and clear this account's browser copy? Save to your account or download a backup first if you want to keep unsynced changes.",
                    )
                  )
                    return;
                  setBusy(true);
                  try {
                    const auth = browserAuth();
                    if (!auth)
                      throw new Error("Authentication is unavailable.");
                    const result = await auth.auth.signOut();
                    if (result.error) throw result.error;
                    if (config.user)
                      localStorage.removeItem(
                        `homebridge-user-${config.user.id}`,
                      );
                    await refreshConfig();
                    notify(
                      "Signed out and cleared this account’s local copy. Your guest workspace is separate.",
                    );
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <LogOut size={15} />
                Sign out
              </button>
            </>
          ) : config.auth ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void signIn();
              }}
            >
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
              <button className="hb-btn hb-primary" disabled={busy}>
                <Mail size={15} />
                Email a sign-in link
              </button>
              <button
                type="button"
                className="hb-btn hb-outline"
                disabled={busy}
                onClick={() => void signIn(true)}
              >
                Continue with Google
              </button>
              <small>
                Google sign-in must be enabled in your Supabase project.
              </small>
            </form>
          ) : (
            <>
              <p>
                Authentication is not connected. You’re using a real, functional
                guest workspace saved only in this browser. There is no fake
                account or cross-device sync.
              </p>
              <Link href="/homes?demo=1" className="hb-btn hb-primary">
                Continue as guest <ArrowRight size={16} />
              </Link>
              <Link href="/integrations" className="hb-text-link">
                Authentication setup details
              </Link>
            </>
          )}
          {error && (
            <div className="hb-error" role="alert">
              {error}
            </div>
          )}
        </section>
        <section className="hb-panel">
          <span className="hb-ai-symbol">
            <ShieldCheck size={23} />
          </span>
          <h2>Preferences & privacy</h2>
          <label>
            Optional first name
            <input
              maxLength={60}
              value={state.profile.name}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  profile: { ...s.profile, name: e.target.value },
                }))
              }
            />
          </label>
          <p>
            Property conversations are separate. Cross-property preference
            memory is off until you enable it on a property’s preferences
            screen.
          </p>
          <p>
            Live AI is separately opt-in for each property. It never receives
            private documents automatically. Guest simulations never contact
            real agents, sellers, or lenders.
          </p>
          <button
            className="hb-btn hb-outline"
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(state, null, 2)], {
                  type: "application/json",
                }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "homebridge-workspace-backup.json";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            <Download size={15} />
            Download workspace backup
          </button>
        </section>
      </div>
      {config.user && (
        <section className="hb-panel hb-sync-panel">
          <h2>
            <Cloud size={21} />
            Account sync
          </h2>
          <p>
            Choose which copy to replace. Export a backup first if you want to
            keep both. Sync does not run silently.
          </p>
          <label className="hb-checkbox">
            <input
              type="checkbox"
              checked={syncConfirm}
              onChange={(e) => setSyncConfirm(e.target.checked)}
            />
            I understand saving replaces the cloud copy, and loading replaces
            this account’s browser copy.
          </label>
          <div className="hb-row">
            <button
              className="hb-btn hb-primary"
              disabled={busy}
              onClick={() => void sync()}
            >
              Save this workspace to account
            </button>
            <button
              className="hb-btn hb-outline"
              disabled={busy}
              onClick={() => void sync(true)}
            >
              Load my cloud workspace
            </button>
            <button
              className="hb-btn hb-quiet"
              onClick={() => {
                if (!syncConfirm) {
                  setError("Confirm replacement before copying guest work.");
                  return;
                }
                const guest = loadWorkspace(localStorage, GUEST_KEY);
                update(() => ({ ...guest, role: "buyer" }));
                notify(
                  "Guest work copied into this account’s browser workspace. Save to sync it.",
                );
              }}
            >
              Copy guest work into this account
            </button>
          </div>
        </section>
      )}
      <section className="hb-panel hb-reset-panel">
        <h2>Reset this demo workspace</h2>
        <p>
          This removes current v2 browser changes for this guest or account. It
          does not delete a cloud copy or the original v1 demo storage.
        </p>
        <label className="hb-checkbox">
          <input
            type="checkbox"
            checked={resetConfirm}
            onChange={(e) => setResetConfirm(e.target.checked)}
          />
          I want to reset this browser workspace.
        </label>
        <button
          className="hb-btn hb-outline"
          disabled={!resetConfirm}
          onClick={() => {
            reset();
            setResetConfirm(false);
          }}
        >
          <RefreshCw size={15} />
          Reset demo workspace
        </button>
      </section>
    </div>
  );
}
