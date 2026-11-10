import { Assumptions, Home, assumptionsSchema } from "./schema";
export function defaultAssumptions(home: Home): Assumptions {
  return assumptionsSchema.parse({
    price: home.price || 500000,
    taxAnnual: home.taxAnnual ?? 2400,
    hoa: home.hoa ?? 0,
  });
}
export function calculatePayment(a: Assumptions) {
  const loan = a.price * (1 - a.downPercent / 100),
    r = a.rate / 1200,
    n = a.years * 12;
  const pi =
    loan === 0
      ? 0
      : r === 0
        ? loan / n
        : (loan * r) / (1 - Math.pow(1 + r, -n));
  const pmi = a.downPercent < 20 ? (loan * a.pmiRate) / 1200 : 0;
  const total =
    pi +
    a.taxAnnual / 12 +
    a.insuranceAnnual / 12 +
    a.hoa +
    pmi +
    a.otherMonthly;
  const down = (a.price * a.downPercent) / 100;
  const closing = (a.price * a.closingPercent) / 100;
  return {
    loan,
    pi,
    pmi,
    total,
    down,
    closing,
    cashToClose: down + closing,
    totalInterest: pi * n - loan,
  };
}
export const dollars = (n: number | null) =>
  n === null
    ? "Not provided"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n);
