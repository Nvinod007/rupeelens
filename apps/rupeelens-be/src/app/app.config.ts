/** Feature flags and app-level config (read from env at boot). */

export function isSetuEnabled(): boolean {
  const flag = process.env.ENABLE_SETU?.trim().toLowerCase();
  return flag === "true" || flag === "1";
}
