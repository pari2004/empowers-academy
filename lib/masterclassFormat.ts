export const formatMasterclassDate = (date: Date) =>
  new Date(date).toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const formatMasterclassTime = (date: Date) =>
  new Date(date).toLocaleString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

export const formatMasterclassDateTime = (date: Date) =>
  new Date(date).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });

// Google Calendar's "quick add" template — no API key or auth needed, just a
// URL the browser opens directly.
export function googleCalendarUrl(opts: {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  durationMinutes?: number;
}) {
  const toUtcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const start = new Date(opts.start);
  const end = new Date(start.getTime() + (opts.durationMinutes ?? 60) * 60_000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
  });
  if (opts.description) params.set("details", opts.description);
  if (opts.location) params.set("location", opts.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
