// Published event dates are calendar dates, never browser-local timestamps.
export function publishedEventDay(event) {
  if (/research-excellence/.test(event.image || "")) return "2026-03-07";
  const match = String(event.date || "").match(
    /\b(\d{1,2})\s+([A-Za-z]{3,9})\s+(20\d{2})\b/,
  );
  if (!match) return null;
  const month = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ].indexOf(match[2].slice(0, 3).toLowerCase());
  if (month < 0) return null;
  const date = new Date(Date.UTC(Number(match[3]), month, Number(match[1])));
  if (date.getUTCMonth() !== month || date.getUTCDate() !== Number(match[1]))
    return null;
  return date.toISOString().slice(0, 10);
}
export function colomboDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
