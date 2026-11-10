'use client';

import type { Transaction } from '@shared-types';
import {
  resolveSpendRange,
  transactionInSpendRange,
  ymdInZone,
  type CustomRangeYmd,
  type SpendPeriod,
} from '@shared-utils';
import { useMemo, useState } from 'react';

export function useSpendPeriodFilter(transactions: Transaction[]) {
  const [spendPeriod, setSpendPeriod] = useState<SpendPeriod>('month');
  const [customRange, setCustomRange] = useState<CustomRangeYmd>(() => {
    const today = ymdInZone(new Date());
    return { from: `${today.slice(0, 7)}-01`, to: today };
  });

  const visibleTransactions = useMemo(() => {
    if (spendPeriod === 'all') {
      return transactions;
    }
    const range = resolveSpendRange(
      spendPeriod,
      new Date(),
      spendPeriod === 'custom' ? customRange : undefined
    );
    return transactions.filter((t) =>
      t.status === 'draft'
        ? true
        : transactionInSpendRange(t.bookedAt, range)
    );
  }, [transactions, spendPeriod, customRange]);

  return {
    customRange,
    setCustomRange,
    setSpendPeriod,
    spendPeriod,
    visibleTransactions,
  };
}
