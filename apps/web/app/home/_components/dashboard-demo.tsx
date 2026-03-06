'use client';

import { useState, useEffect } from 'react';
import DashboardDemoCharts from './dashboard-demo-charts';

import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Trans } from '@kit/ui/trans';



export interface DashboardStats {
  servicesCount: number;
  tablesCount: number;
  totalCapacity: number;
  reservationsCount: number;
  clientsCount: number;
  reservationsTrend: { name: string, value: number }[];
  guestsTrend: { name: string, value: number }[];
  clientsTrend: { name: string, value: number }[];
  topCustomers: {
    name: string;
    email: string;
    reservationsCount: number;
    guestCount: number;
    lastReservation: string;
  }[];
}

export function DashboardDemo({ stats }: { stats: DashboardStats }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <LoadingOverlay>
        <span className={'text-muted-foreground'}>
          <Trans i18nKey={'common:loading'} />
        </span>
      </LoadingOverlay>
    );
  }

  return <DashboardDemoCharts stats={stats} />;
}
