// Shared by the commodities strip and its detail pages, one source of truth for the mapping.
export const COMMODITIES = [
  { slug: "gold", ticker: "GC=F", label: "Gold", unit: "oz", tvSymbol: "TVC:GOLD" },
  { slug: "silver", ticker: "SI=F", label: "Silver", unit: "oz", tvSymbol: "TVC:SILVER" },
  { slug: "oil", ticker: "CL=F", label: "Oil", unit: "barrel", tvSymbol: "TVC:USOIL" },
  { slug: "natural-gas", ticker: "NG=F", label: "Natural Gas", unit: "MMBtu", tvSymbol: "TVC:NATURALGAS" },
];

export function getCommodityBySlug(slug) {
  return COMMODITIES.find((c) => c.slug === slug) ?? null;
}
