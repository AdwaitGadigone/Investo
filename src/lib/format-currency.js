// Matches the convention already used on the ticker page: a currency code prefix for anything non-USD, $ for USD.
// No "server-only" here, this runs in client components (portfolio-section.jsx) too.
export function formatPrice(amount, currency) {
  const prefix = currency && currency !== "USD" ? `${currency} ` : "$";
  return `${prefix}${amount.toFixed(2)}`;
}

export function formatSignedPrice(amount, currency) {
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}${formatPrice(Math.abs(amount), currency)}`;
}
