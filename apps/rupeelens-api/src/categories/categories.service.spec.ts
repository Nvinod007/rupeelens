import { BadRequestException, NotFoundException } from '@nestjs/common';

import { InMemoryCategoriesRepository } from './repositories/in-memory-categories.repository';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(() => {
    service = new CategoriesService(new InMemoryCategoriesRepository());
  });

  it('rejects empty names', async () => {
    await expect(service.add('u1', '   ')).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it('does not duplicate built-ins or existing custom names', async () => {
    const first = await service.add('u1', 'Cooler');
    expect(first).toHaveLength(1);
    const again = await service.add('u1', 'cooler');
    expect(again).toHaveLength(1);
    const builtIn = await service.add('u1', 'groceries');
    expect(builtIn).toHaveLength(1);
  });

  it('isolates owners', async () => {
    await service.add('a', 'Pooja');
    await service.add('b', 'Pooja Supplies');
    expect((await service.list('a')).map((c) => c.name)).toEqual(['Pooja']);
    expect((await service.list('b')).map((c) => c.name)).toEqual([
      'Pooja Supplies',
    ]);
  });

  it('remove is owner-scoped', async () => {
    const list = await service.add('owner', 'Custom');
    const id = list[0].id;
    await expect(service.remove('other', id)).rejects.toBeInstanceOf(
      NotFoundException
    );
    await service.remove('owner', id);
    expect(await service.list('owner')).toHaveLength(0);
  });
});
