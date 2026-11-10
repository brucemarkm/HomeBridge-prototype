import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mortgage,
  parseSearch,
  properties,
  initialState,
  demoAnswer,
} from "../lib/model";
test("standard fixed mortgage and zero-rate loan", () => {
  const m = mortgage(500000, 20, 6, 30, 2400, 1200, 100);
  assert.ok(Math.abs(m.pi - 2398.2) < 0.01);
  assert.ok(Math.abs(m.total - 2798.2) < 0.01);
  assert.equal(m.pmi, 0);
  assert.equal(m.down, 100000);
  assert.equal(mortgage(120000, 0, 0, 10, 0, 0, 0).pi, 1000);
});
test("mortgage insurance below twenty percent down", () => {
  assert.equal(mortgage(500000, 10, 6, 30, 0, 0, 0).pmi, 187.5);
});
test("natural-language demo discovery uses available facts", () => {
  assert.deepEqual(parseSearch("3-bedroom home in Provo under $550,000"), {
    city: "Provo",
    max: 550000,
    beds: 3,
  });
  assert.equal(parseSearch("Orem under 500k").max, 500000);
  assert.match(demoAnswer("Provo under 550k", properties), /Juniper Lane/);
});
test("seeded relationships and isolated reset objects", () => {
  assert.equal(properties.length, 28);
  assert.equal(new Set(properties.map((p) => p.id)).size, 28);
  const a = initialState(),
    b = initialState();
  a.saved.push("new");
  assert.equal(b.saved.length, 3);
  for (const t of a.transactions)
    assert.ok(properties.some((p) => p.id === t.propertyId));
  assert.match(
    demoAnswer("what is earnest money?", properties),
    /No money moves/,
  );
});

test("local repository safely restores and resets persisted demo data", async () => {
  const { createLocalRepository } = await import("../lib/providers");
  let value: string | null = null;
  const repository = createLocalRepository({
    getItem: () => value,
    setItem: (_key, v) => {
      value = v;
    },
  });
  assert.equal(repository.load().saved.length, 3);
  const state = initialState();
  state.fee = 3500;
  state.activePurchaseId = "purchase-2";
  repository.save(state);
  assert.equal(repository.load().fee, 3500);
  assert.equal(repository.load().activePurchaseId, "purchase-2");
  value = "{broken";
  assert.equal(repository.load().fee, 2995);
  value = JSON.stringify({ version: 1, transactions: [] });
  assert.equal(repository.load().transactions.length, 3);
});
