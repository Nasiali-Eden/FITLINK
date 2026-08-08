export function eventDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date to be confirmed";
  return new Intl.DateTimeFormat("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  }).format(date);
}
