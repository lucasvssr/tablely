'use client';

import dynamic from 'next/dynamic';

import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Trans } from '@kit/ui/trans';

const DashboardDemoCharts = dynamic(() => import('./dashboard-demo-charts'), {
  ssr: false,
  loading: () => (
    <LoadingOverlay>
      <span className={'text-muted-foreground'}>
        <Trans i18nKey={'common:loading'} />
      </span>
    </LoadingOverlay>
  ),
});

export interface DashboardStats {
  servicesCount: number;
  tablesCount: number;
  totalCapacity: number;
}

export function DashboardDemo({ stats }: { stats: DashboardStats }) {
  return <DashboardDemoCharts stats={stats} />;
}
