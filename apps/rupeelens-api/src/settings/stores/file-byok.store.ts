import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';

import { storageConfig } from '../../config/configuration';
import { ByokStore } from '../byok.store';

type FileContents = Record<string, string>;

/** Local development fallback; keeps keys across API restarts. */
@Injectable()
export class FileByokStore extends ByokStore {
  readonly name = 'file';
  private readonly path: string;
  /** Serialises read-modify-write cycles so concurrent saves cannot clobber each other. */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    @Inject(storageConfig.KEY)
    config: ConfigType<typeof storageConfig>
  ) {
    super();
    this.path = resolve(process.cwd(), config.byokFilePath);
  }

  async get(ownerId: string): Promise<string | null> {
    return (await this.read())[ownerId] ?? null;
  }

  set(ownerId: string, encrypted: string): Promise<void> {
    return this.mutate((contents) => {
      contents[ownerId] = encrypted;
    });
  }

  delete(ownerId: string): Promise<void> {
    return this.mutate((contents) => {
      delete contents[ownerId];
    });
  }

  private mutate(change: (contents: FileContents) => void): Promise<void> {
    const run = async () => {
      const contents = await this.read();
      change(contents);
      await mkdir(dirname(this.path), { recursive: true });
      await writeFile(this.path, JSON.stringify(contents), { mode: 0o600 });
    };
    const next = this.queue.then(run, run);
    this.queue = next.catch(() => undefined);
    return next;
  }

  private async read(): Promise<FileContents> {
    try {
      return JSON.parse(await readFile(this.path, 'utf8')) as FileContents;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {};
      }
      throw error;
    }
  }
}
