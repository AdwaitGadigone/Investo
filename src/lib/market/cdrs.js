// CIBC's CDRs (CAD-hedged fractional US shares on Cboe Canada), injected into /api/search since Yahoo's own search misses them.
// tvSymbol is exchange-prefixed (confirmed against each underlying's real Yahoo exchange, NMS/NYQ), TradingView's
// widget doesn't reliably resolve a bare ticker like "AAPL" with no exchange, that was the bug behind CDR charts
// silently not rendering, it wasn't hitting the fallback UI's error path, the widget just never resolved a symbol.
export const CDRS = [
  { ticker: "AAPL.NE", underlying: "AAPL", tvSymbol: "NASDAQ:AAPL", name: "Apple" },
  { ticker: "ABBV.NE", underlying: "ABBV", tvSymbol: "NYSE:ABBV", name: "AbbVie" },
  { ticker: "AMD.NE", underlying: "AMD", tvSymbol: "NASDAQ:AMD", name: "Advanced Micro Devices" },
  { ticker: "AMZN.NE", underlying: "AMZN", tvSymbol: "NASDAQ:AMZN", name: "Amazon.com" },
  { ticker: "BOFA.NE", underlying: "BAC", tvSymbol: "NYSE:BAC", name: "Bank of America" },
  { ticker: "BRK.NE", underlying: "BRK-B", tvSymbol: "NYSE:BRK.B", name: "Berkshire Hathaway" },
  { ticker: "COLA.NE", underlying: "KO", tvSymbol: "NYSE:KO", name: "Coca-Cola" },
  { ticker: "COST.NE", underlying: "COST", tvSymbol: "NASDAQ:COST", name: "Costco" },
  { ticker: "CRM.NE", underlying: "CRM", tvSymbol: "NYSE:CRM", name: "Salesforce" },
  { ticker: "CSCO.NE", underlying: "CSCO", tvSymbol: "NASDAQ:CSCO", name: "Cisco" },
  { ticker: "CVS.NE", underlying: "CVS", tvSymbol: "NYSE:CVS", name: "CVS Health" },
  { ticker: "DIS.NE", underlying: "DIS", tvSymbol: "NYSE:DIS", name: "Walt Disney" },
  { ticker: "GOOG.NE", underlying: "GOOG", tvSymbol: "NASDAQ:GOOG", name: "Alphabet" },
  { ticker: "GS.NE", underlying: "GS", tvSymbol: "NYSE:GS", name: "Goldman Sachs" },
  { ticker: "HD.NE", underlying: "HD", tvSymbol: "NYSE:HD", name: "Home Depot" },
  { ticker: "HON.NE", underlying: "HON", tvSymbol: "NASDAQ:HON", name: "Honeywell" },
  { ticker: "IBM.NE", underlying: "IBM", tvSymbol: "NYSE:IBM", name: "IBM" },
  { ticker: "JPM.NE", underlying: "JPM", tvSymbol: "NYSE:JPM", name: "JPMorgan Chase" },
  { ticker: "MA.NE", underlying: "MA", tvSymbol: "NYSE:MA", name: "Mastercard" },
  { ticker: "MCDS.NE", underlying: "MCD", tvSymbol: "NYSE:MCD", name: "McDonald's" },
  { ticker: "META.NE", underlying: "META", tvSymbol: "NASDAQ:META", name: "Meta Platforms" },
  { ticker: "MSFT.NE", underlying: "MSFT", tvSymbol: "NASDAQ:MSFT", name: "Microsoft" },
  { ticker: "NFLX.NE", underlying: "NFLX", tvSymbol: "NASDAQ:NFLX", name: "Netflix" },
  { ticker: "NKE.NE", underlying: "NKE", tvSymbol: "NYSE:NKE", name: "Nike" },
  { ticker: "NVDA.NE", underlying: "NVDA", tvSymbol: "NASDAQ:NVDA", name: "Nvidia" },
  { ticker: "PFE.NE", underlying: "PFE", tvSymbol: "NYSE:PFE", name: "Pfizer" },
  { ticker: "PG.NE", underlying: "PG", tvSymbol: "NYSE:PG", name: "Procter & Gamble" },
  { ticker: "PYPL.NE", underlying: "PYPL", tvSymbol: "NASDAQ:PYPL", name: "PayPal" },
  { ticker: "SBUX.NE", underlying: "SBUX", tvSymbol: "NASDAQ:SBUX", name: "Starbucks" },
  { ticker: "TSLA.NE", underlying: "TSLA", tvSymbol: "NASDAQ:TSLA", name: "Tesla" },
  { ticker: "UNH.NE", underlying: "UNH", tvSymbol: "NYSE:UNH", name: "UnitedHealth" },
  { ticker: "UPS.NE", underlying: "UPS", tvSymbol: "NYSE:UPS", name: "United Parcel Service" },
  { ticker: "VISA.NE", underlying: "V", tvSymbol: "NYSE:V", name: "Visa" },
  { ticker: "VZ.NE", underlying: "VZ", tvSymbol: "NYSE:VZ", name: "Verizon" },
  { ticker: "WMT.NE", underlying: "WMT", tvSymbol: "NASDAQ:WMT", name: "Walmart" },
];

// Reverse lookup, CDR ticker -> real US ticker, used to chart a CDR via TradingView when Yahoo has too little CDR data to plot.
export function getUnderlyingTicker(cdrTicker) {
  return CDRS.find((c) => c.ticker === cdrTicker.toUpperCase())?.underlying ?? null;
}

// Same lookup but exchange-prefixed, the form TradingView's widget actually needs to resolve reliably.
export function getUnderlyingTvSymbol(cdrTicker) {
  return CDRS.find((c) => c.ticker === cdrTicker.toUpperCase())?.tvSymbol ?? null;
}

// Matches a search query against underlying ticker or company name, so typing "AAPL" or "apple" both find the CDR.
export function findCdrMatches(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CDRS.filter((c) => c.underlying.toLowerCase() === q || c.name.toLowerCase().includes(q));
}
