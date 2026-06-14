/** Local part of email/name: split on @, then `.`, join with spaces. */
export function displayNameFromEmail(value: string): string {
  const local = value.split("@")[0]?.trim() || value.trim();
  const parts = local
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : value.trim();
}
