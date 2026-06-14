/** Stub UPI parser — extract merchant from UPI/swiggy@ybl/... narrations. */
export function parseMerchantFromNarration(narration: string): string | null {
  const match = narration.match(/^UPI\/([^/@]+)/i);
  if (!match) {
    return null;
  }

  const raw = match[1];
  if (/^\d+$/.test(raw)) {
    return null;
  }

  const name = raw.split("@")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}
