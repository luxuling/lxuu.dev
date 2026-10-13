import { useEffect, useState } from 'react';
import { getStats, type EngagementStats } from '@/services/engagement-api';
import type { EngagementTarget } from '@/services/engagement-targets';

export const useStats = (target: EngagementTarget, slug: string) => {
  const [stats, setStats] = useState<EngagementStats | null>(null);

  useEffect(() => {
    void getStats(target, slug).then(setStats);
  }, [target, slug]);

  return stats;
};
