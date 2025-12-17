// Formatting utilities

export const formatCurrency = (v) =>
  v >= 1000000
    ? `$${(v/1000000).toFixed(1)}M`
    : v >= 1000
      ? `$${(v/1000).toFixed(0)}K`
      : `$${Math.round(v).toLocaleString()}`;

export const formatPct = (v) => `${(v * 100).toFixed(1)}%`;

export const formatNumber = (v) => Math.round(v).toLocaleString();

export const formatWeeks = (weeks) => {
  if (weeks >= 52) {
    const years = Math.floor(weeks / 52);
    const remainingWeeks = weeks % 52;
    return remainingWeeks > 0
      ? `${years}y ${remainingWeeks}w`
      : `${years}y`;
  }
  return `${weeks}w`;
};
