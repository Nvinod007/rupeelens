import type { LoggerService } from '@nestjs/common';

type Level = 'debug' | 'error' | 'log' | 'verbose' | 'warn';

/** One JSON object per line on stdout/stderr, so hosts (Northflank etc.) can index fields. */
export class JsonLogger implements LoggerService {
  log(message: unknown, ...rest: unknown[]) {
    this.write('log', message, rest);
  }

  error(message: unknown, ...rest: unknown[]) {
    this.write('error', message, rest);
  }

  warn(message: unknown, ...rest: unknown[]) {
    this.write('warn', message, rest);
  }

  debug(message: unknown, ...rest: unknown[]) {
    this.write('debug', message, rest);
  }

  verbose(message: unknown, ...rest: unknown[]) {
    this.write('verbose', message, rest);
  }

  private write(level: Level, message: unknown, rest: unknown[]) {
    // Nest passes the context last; for errors the stack may precede it.
    const context =
      typeof rest.at(-1) === 'string' ? (rest.at(-1) as string) : undefined;
    const stack =
      level === 'error' && typeof rest[0] === 'string' && rest.length > 1
        ? rest[0]
        : undefined;

    const entry =
      message !== null && typeof message === 'object' && !(message instanceof Error)
        ? { ...(message as Record<string, unknown>) }
        : { message: message instanceof Error ? message.message : String(message) };

    const line = JSON.stringify({
      ...entry,
      context,
      level,
      stack: stack ?? (message instanceof Error ? message.stack : undefined),
      ts: new Date().toISOString(),
    });
    (level === 'error' || level === 'warn' ? process.stderr : process.stdout).write(
      `${line}\n`
    );
  }
}
