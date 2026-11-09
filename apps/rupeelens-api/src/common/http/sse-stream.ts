import type { Response } from 'express';

/** Thin wrapper that owns the Server-Sent Events wire format. */
export class SseStream {
  constructor(private readonly response: Response) {}

  open(): void {
    this.response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    this.response.setHeader('Cache-Control', 'no-cache, no-transform');
    this.response.setHeader('Connection', 'keep-alive');
    this.response.setHeader('X-Accel-Buffering', 'no');
    this.response.flushHeaders?.();
  }

  send(event: string, data: unknown): void {
    this.response.write(`event: ${event}\n`);
    this.response.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  close(): void {
    this.response.end();
  }
}
