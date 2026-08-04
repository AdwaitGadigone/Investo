// CIBC's Canadian Depositary Receipts: fractional, CAD-hedged shares of US stocks, traded on Cboe Canada (NEO).
// Yahoo's own search doesn't surface these for a plain "AAPL" query, so /api/search injects matches from this list.
// Verified against real Yahoo Finance quotes, several CDR tickers don't match the underlying (BOFA, COLA, MCDS, VISA, BRK).
export const CDRS = [
  { ticker: "AAPL.NE", underlying: "AAPL", name: "Apple" },
  { ticker: "ABBV.NE", underlying: "ABBV", name: "AbbVie" },
  { ticker: "AMD.NE", underlying: "AMD", name: "Advanced Micro Devices" },
  { ticker: "AMZN.NE", underlying: "AMZN", name: "Amazon.com" },
  { ticker: "BOFA.NE", underlying: "BAC", name: "Bank of America" },
  { ticker: "BRK.NE", underlying: "BRK-B", name: "Berkshire Hathaway" },
  { ticker: "COLA.NE", underlying: "KO", name: "Coca-Cola" },
  { ticker: "COST.NE", underlying: "COST", name: "Costco" },
  { ticker: "CRM.NE", underlying: "CRM", name: "Salesforce" },
  { ticker: "CSCO.NE", underlying: "CSCO", name: "Cisco" },
  { ticker: "CVS.NE", underlying: "CVS", name: "CVS Health" },
  { ticker: "DIS.NE", underlying: "DIS", name: "Walt Disney" },
  { ticker: "GOOG.NE", underlying: "GOOG", name: "Alphabet" },
  { ticker: "GS.NE", underlying: "GS", name: "Goldman Sachs" },
  { ticker: "HD.NE", underlying: "HD", name: "Home Depot" },
  { ticker: "HON.NE", underlying: "HON", name: "Honeywell" },
  { ticker: "IBM.NE", underlying: "IBM", name: "IBM" },
  { ticker: "JPM.NE", underlying: "JPM", name: "JPMorgan Chase" },
  { ticker: "MA.NE", underlying: "MA", name: "Mastercard" },
  { ticker: "MCDS.NE", underlying: "MCD", name: "McDonald's" },
  { ticker: "META.NE", underlying: "META", name: "Meta Platforms" },
  { ticker: "MSFT.NE", underlying: "MSFT", name: "Microsoft" },
  { ticker: "NFLX.NE", underlying: "NFLX", name: "Netflix" },
  { ticker: "NKE.NE", underlying: "NKE", name: "Nike" },
  { ticker: "NVDA.NE", underlying: "NVDA", name: "Nvidia" },
  { ticker: "PFE.NE", underlying: "PFE", name: "Pfizer" },
  { ticker: "PG.NE", underlying: "PG", name: "Procter & Gamble" },
  { ticker: "PYPL.NE", underlying: "PYPL", name: "PayPal" },
  { ticker: "SBUX.NE", underlying: "SBUX", name: "Starbucks" },
  { ticker: "TSLA.NE", underlying: "TSLA", name: "Tesla" },
  { ticker: "UNH.NE", underlying: "UNH", name: "UnitedHealth" },
  { ticker: "UPS.NE", underlying: "UPS", name: "United Parcel Service" },
  { ticker: "VISA.NE", underlying: "V", name: "Visa" },
  { ticker: "VZ.NE", underlying: "VZ", name: "Verizon" },
  { ticker: "WMT.NE", underlying: "WMT", name: "Walmart" },
];

// Reverse lookup, CDR ticker -> real US ticker, used to chart a CDR via TradingView when Yahoo has too little CDR data to plot.
export function getUnderlyingTicker(cdrTicker) {
  return CDRS.find((c) => c.ticker === cdrTicker.toUpperCase())?.underlying ?? null;
}

// Matches a search query against underlying ticker or company name, so typing "AAPL" or "apple" both find the CDR.
export function findCdrMatches(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CDRS.filter((c) => c.underlying.toLowerCase() === q || c.name.toLowerCase().includes(q));
}
