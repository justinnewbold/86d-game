// Formatting utilities

export const formatCurrency = (v: number): string => {
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}K`;
  return `${sign}$${Math.round(abs).toLocaleString()}`;
};

export const formatPct = (v: number): string => `${(v * 100).toFixed(1)}%`;

export const formatNumber = (v: number): string => Math.round(v).toLocaleString();

export const formatWeeks = (weeks: number): string => {
  if (weeks >= 52) {
    const years = Math.floor(weeks / 52);
    const remainingWeeks = weeks % 52;
    return remainingWeeks > 0 ? `${years}y ${remainingWeeks}w` : `${years}y`;
  }
  return `${weeks}w`;
};
