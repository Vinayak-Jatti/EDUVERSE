// ─── Date ─────────────────────────────────────────
export const formatDate = (dateStr, locale = "en-IN") => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── String ───────────────────────────────────────
export const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const truncate = (str = "", maxLength = 100) =>
  str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

// ─── Number ───────────────────────────────────────
export const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
