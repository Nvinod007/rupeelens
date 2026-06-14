const BEARER_PREFIX = "Bearer ";

/** Parse `Authorization: Bearer <token>` header value. Returns null if missing or malformed. */
export function parseBearerToken(
  authorizationHeader: string | undefined
): string | null {
  if (!authorizationHeader?.startsWith(BEARER_PREFIX)) {
    return null;
  }

  const token = authorizationHeader.slice(BEARER_PREFIX.length).trim();
  return token.length > 0 ? token : null;
}
