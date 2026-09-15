const WEEKDAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(dateISO: string, days: number): string {
  const date = new Date(dateISO);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetweenISO(fromISO: string, toISO: string): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((new Date(toISO).getTime() - new Date(fromISO).getTime()) / MS_PER_DAY) + 1;
}

export function formatHebrewDate(dateISO: string): string {
  const date = new Date(dateISO);
  const weekday = WEEKDAYS[date.getUTCDay()];
  const month = MONTHS[date.getUTCMonth()];
  return `יום ${weekday}, ${date.getUTCDate()} ב${month}`;
}
