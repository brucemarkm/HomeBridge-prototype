"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Workspace, Home, BuyerProfile } from "../../lib/homebridge/schema";
import {
  demoHomes,
  freshWorkspace,
  emptyProfile,
} from "../../lib/homebridge/demo";
import {
  loadWorkspace,
  saveWorkspace,
  GUEST_KEY,
} from "../../lib/homebridge/storage";
export type AppConfig = {
  auth: boolean;
  ai: boolean;
  listings: boolean;
  resolver?: boolean;
  user: null | { id: string; email?: string };
};
type Store = {
  state: Workspace;
  update: (fn: (s: Workspace) => Workspace) => void;
  ready: boolean;
  config: AppConfig;
  refreshConfig: () => Promise<void>;
  notify: (text: string) => void;
  all: Home[];
  profileFor: (id: string) => BuyerProfile;
  saveHome: (home: Home) => void;
  reset: () => void;
};
const Context = createContext<Store | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(freshWorkspace);
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<AppConfig>({
    auth: false,
    ai: false,
    listings: false,
    user: null,
  });
  const [toast, setToast] = useState("");
  const [storageKey, setStorageKey] = useState(GUEST_KEY);
  const [configError, setConfigError] = useState(false);
  const update = useCallback(
    (fn: (s: Workspace) => Workspace) => setState(fn),
    [],
  );
  const notify = useCallback((text: string) => setToast(text), []);
  const refreshConfig = useCallback(async () => {
    try {
      const r = await fetch("/api/config", {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) throw Error();
      const c: AppConfig = await r.json();
      const key = c.user ? `homebridge-user-${c.user.id}` : GUEST_KEY;
      setConfig(c);
      setStorageKey(key);
      setState(loadWorkspace(localStorage, key));
      setConfigError(false);
    } catch {
      setConfigError(true);
      setState(loadWorkspace(localStorage));
    }
    setReady(true);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Restores external session and browser data after hydration.
    void refreshConfig();
  }, [refreshConfig]);
  // Persistence mirrors React state to the external browser store; restore happens in the async initializer above.
  useEffect(() => {
    if (!ready) return;
    try {
      saveWorkspace(localStorage, state, storageKey);
    } catch {
      queueMicrotask(() =>
        notify(
          "This browser could not save your latest changes. Export your PDFs before leaving, or free browser storage.",
        ),
      );
    }
  }, [state, ready, storageKey, notify]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5500);
    return () => clearTimeout(t);
  }, [toast]);
  const all = [
    ...demoHomes,
    ...state.homes.filter((p) => !demoHomes.some((d) => d.id === p.id)),
  ];
  function profileFor(id: string) {
    return state.profile.remember
      ? state.profile
      : state.propertyProfiles[id] || {
          ...emptyProfile(),
          name: state.profile.name,
        };
  }
  function saveHome(home: Home) {
    update((s) => ({
      ...s,
      homes:
        home.source === "demo"
          ? s.homes
          : [...s.homes.filter((p) => p.id !== home.id), home],
      saved: s.saved.includes(home.id) ? s.saved : [...s.saved, home.id],
    }));
    notify("Home saved in your workspace.");
  }
  function reset() {
    setState(freshWorkspace());
    notify(
      "This workspace has been reset. Your original v1 demo data was left untouched.",
    );
  }
  return (
    <Context.Provider
      value={{
        state,
        update,
        ready,
        config,
        refreshConfig,
        notify,
        all,
        profileFor,
        saveHome,
        reset,
      }}
    >
      {configError && (
        <div className="hb-service-notice">
          Connection status could not load. Your local demo is available.{" "}
          <button onClick={() => void refreshConfig()}>Retry connection</button>
        </div>
      )}
      {children}
      {toast && (
        <div className="hb-toast" role="status">
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const store = useContext(Context);
  if (!store) throw Error("Workspace provider is required");
  return store;
}
export async function postJson(
  path: string,
  data: unknown,
  signal?: AbortSignal,
) {
  const r = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Homebridge-Request": "1",
    },
    body: JSON.stringify(data),
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(45000)])
      : AbortSignal.timeout(45000),
  });
  if (!r.ok) {
    const error = await r
      .json()
      .catch(() => ({ error: "The request could not be completed." }));
    throw Error(error.error);
  }
  return r;
}
