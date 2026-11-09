import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Loads `apps/rupeelens-api/.env` before anything reads configuration.
 * `override` makes the app file win over stale shell exports (e.g. an old
 * GEMINI_MODEL left in the terminal session).
 */
const envFile = resolve(process.cwd(), 'apps/rupeelens-api/.env');

if (existsSync(envFile)) {
  config({ override: true, path: envFile, quiet: true });
}
