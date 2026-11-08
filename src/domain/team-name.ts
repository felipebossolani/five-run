export function normalizeTeamName(value: unknown): string {
  if (typeof value !== "string") return "";
  const clean = value.normalize("NFC").replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "").trim();
  return Array.from(clean).slice(0, 32).join("").trim();
}
