/** Authenticated principal resolved from a verified access token. */
export type AuthUser = {
  id: string;
  email: string | null;
};
