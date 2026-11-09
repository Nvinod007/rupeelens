import { NotFoundException } from '@nestjs/common';

import { InMemoryTransactionsRepository } from './repositories/in-memory-transactions.repository';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(() => {
    service = new TransactionsService(new InMemoryTransactionsRepository());
  });

  it('applies defaults on create', async () => {
    const created = await service.create('owner', {
      amount: 500,
      status: 'saved',
      title: 'Swiggy',
    });

    expect(created).toMatchObject({
      category: null,
      notes: null,
      status: 'saved',
      transcript: null,
    });
    expect(created.id).toBeTruthy();
  });

  it('isolates data per owner and orders newest first', async () => {
    await service.create('a', { amount: 1, bookedAt: '2026-01-01T00:00:00.000Z', status: 'saved', title: 'old' });
    await service.create('a', { amount: 2, bookedAt: '2026-02-01T00:00:00.000Z', status: 'saved', title: 'new' });
    await service.create('b', { amount: 3, status: 'draft', title: 'other' });

    const listed = await service.list('a');
    expect(listed.map((t) => t.title)).toEqual(['new', 'old']);
    expect(await service.list('b')).toHaveLength(1);
  });

  it('updates only provided fields', async () => {
    const created = await service.create('owner', {
      amount: 10,
      category: 'Food & Dining',
      status: 'draft',
      title: 'Lunch',
    });

    const updated = await service.update('owner', created.id, { status: 'saved' });
    expect(updated).toMatchObject({
      category: 'Food & Dining',
      status: 'saved',
      title: 'Lunch',
    });
  });

  it('does not let one owner update another owner\'s transaction', async () => {
    const created = await service.create('a', { amount: 1, status: 'draft', title: 'x' });

    await expect(
      service.update('b', created.id, { title: 'hacked' })
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
