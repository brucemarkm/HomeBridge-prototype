import {
  State,
  Property,
  Transaction,
  initialState,
  properties,
  demoAnswer,
} from "./model";
/** Demo-only persistence. No passwords, tokens, or real client records belong here. */
export interface DemoRepository {
  load(): State;
  save(state: State): void;
}
export const DEMO_STORAGE_KEY = "homebridge-demo-v1";
export function createLocalRepository(
  storage: Pick<Storage, "getItem" | "setItem">,
): DemoRepository {
  return {
    load() {
      try {
        const raw = storage.getItem(DEMO_STORAGE_KEY);
        if (!raw) return initialState();
        const data = JSON.parse(raw);
        if (
          data.version !== 1 ||
          !Array.isArray(data.transactions) ||
          !data.transactions.length ||
          !Array.isArray(data.saved) ||
          !Array.isArray(data.imported) ||
          !Array.isArray(data.docs) ||
          !Array.isArray(data.messages) ||
          !Array.isArray(data.compare) ||
          !Array.isArray(data.chat) ||
          !Array.isArray(data.activity) ||
          typeof data.name !== "string" ||
          typeof data.fee !== "number" ||
          typeof data.preferences !== "object"
        )
          return initialState();
        return { ...initialState(), ...data };
      } catch {
        return initialState();
      }
    },
    save(state) {
      storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    },
  };
}
export interface PropertyProvider {
  readonly mode: "demo" | "authorized";
  list(): Property[];
}
export const demoPropertyProvider: PropertyProvider = {
  mode: "demo",
  list: () => properties,
};
export interface AssistantProvider {
  readonly mode: "scripted-demo";
  answer(
    question: string,
    homes: Property[],
    transaction?: Transaction,
  ): string;
}
export const localAssistantProvider: AssistantProvider = {
  mode: "scripted-demo",
  answer: demoAnswer,
};
/** A future authorized provider must supply documented, licensed data. No URL fetching in demo. */
export interface AuthorizedListingProvider {
  importFromUrl(url: URL): Promise<Property>;
}
/** Future messaging transports must implement server authentication and participant authorization. */
export interface MessageTransport {
  send(conversationId: string, text: string): Promise<void>;
}
