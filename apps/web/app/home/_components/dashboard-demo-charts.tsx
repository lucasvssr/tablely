'use client';

import { useMemo } from 'react';

import { ArrowDown, ArrowUp, Menu, Users, Calendar, Utensils, Layout } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from 'recharts';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@kit/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { DashboardStats } from './dashboard-demo';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function DashboardDemo({ stats }: { stats: DashboardStats }) {
  const { t } = useTranslation('dashboard');
  const reservationsTrend = stats.reservationsTrend || [];
  const guestsTrend = stats.guestsTrend || [];
  const clientsTrend = stats.clientsTrend || [];

  const services = stats?.servicesCount || 0;
  const totalReservations = stats?.reservationsCount || 0;
  const totalClients = stats?.clientsCount || 0;

  return (
    <div
      className={
        'animate-in fade-in flex flex-col space-y-4 pb-36 duration-500'
      }
    >
      <div
        className={
          'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
        }
      >
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <Layout className="h-4 w-4 text-brand-copper" />
              <span>{t('stats.services')}</span>
              <Trend trend={'up'}>{t('stats.active')}</Trend>
            </CardTitle>

            <CardDescription>
              <span>{t('stats.servicesDesc')}</span>
            </CardDescription>

            <div>
              <Figure>{services}</Figure>
            </div>
          </CardHeader>

          <CardContent className={'space-y-4'}>
             <MiniChart data={reservationsTrend.slice(-7)} color="var(--chart-1)" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <Calendar className="h-4 w-4 text-brand-copper" />
              <span>{t('stats.reservations')}</span>
              <Trend trend={'up'}>{t('stats.total')}</Trend>
            </CardTitle>

            <CardDescription>
              <span>{t('stats.reservationsDesc')}</span>
            </CardDescription>

            <div>
              <Figure>{totalReservations}</Figure>
            </div>
          </CardHeader>

          <CardContent>
            <MiniChart data={reservationsTrend} color="var(--chart-2)" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <Utensils className="h-4 w-4 text-brand-copper" />
              <span>{t('stats.guests')}</span>
              <Trend trend={'up'}>{t('stats.service')}</Trend>
            </CardTitle>

            <CardDescription>
              <span>{t('stats.guestsDesc')}</span>
            </CardDescription>

            <div>
              <Figure>{guestsTrend.reduce((acc, curr) => acc + curr.value, 0)}</Figure>
            </div>
          </CardHeader>

          <CardContent>
            <MiniChart data={guestsTrend} color="var(--chart-3)" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <Users className="h-4 w-4 text-brand-copper" />
              <span>{t('stats.clients')}</span>
              <Trend trend={'up'}>{t('stats.loyal')}</Trend>
            </CardTitle>

            <CardDescription>
              <span>{t('stats.clientsDesc')}</span>
            </CardDescription>

            <div>
              <Figure>{totalClients}</Figure>
            </div>
          </CardHeader>

          <CardContent>
            <MiniChart data={clientsTrend} color="var(--chart-4)" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReservationsChart data={reservationsTrend} label={t('stats.reservations')} desc={t('stats.dailyReservations')} />
        <GuestsChart data={guestsTrend} label={t('stats.guests')} desc={t('stats.dailyGuests')} />
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>{t('stats.topClients')}</CardTitle>
            <CardDescription>{t('stats.topClientsDesc')}</CardDescription>
          </CardHeader>

          <CardContent>
            <CustomersTable customers={stats.topCustomers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MiniChart({ data, color }: { data: { name: string, value: number }[], color: string }) {
  const chartConfig = {
    value: {
      label: 'Value',
      color: color,
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="h-[60px] w-full">
      <LineChart accessibilityLayer data={data}>
        <Line
          dataKey="value"
          type="natural"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

function CustomersTable({ customers }: { customers: DashboardStats['topCustomers'] }) {
  const { t } = useTranslation('dashboard');
  if (!customers || customers.length === 0) {
      return (
          <div className="text-center py-10 text-muted-foreground">
              {t('stats.noClients')}
          </div>
      );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('stats.table.client')}</TableHead>
          <TableHead>{t('stats.table.reservations')}</TableHead>
          <TableHead>{t('stats.table.totalGuests')}</TableHead>
          <TableHead>{t('stats.table.lastVisit')}</TableHead>
          <TableHead>{t('stats.table.status')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.email}>
            <TableCell className={'flex flex-col'}>
              <span className="font-medium text-foreground">{customer.name}</span>
              <span className={'text-muted-foreground text-sm'}>
                {customer.email}
              </span>
            </TableCell>
            <TableCell className="font-semibold">{customer.reservationsCount}</TableCell>
            <TableCell>{customer.guestCount}</TableCell>
            <TableCell>{format(parseISO(customer.lastReservation), 'dd MMM yyyy')}</TableCell>
            <TableCell>
              <BadgeWithTrend trend={customer.reservationsCount > 3 ? 'up' : 'stale'}>
                {customer.reservationsCount > 3 ? t('stats.vip') : t('stats.regular')}
              </BadgeWithTrend>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BadgeWithTrend(props: React.PropsWithChildren<{ trend: string }>) {
  const className = useMemo(() => {
    switch (props.trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-destructive';
      case 'stale':
        return 'text-orange-500';
    }
  }, [props.trend]);

  return (
    <Badge
      variant={'outline'}
      className={'border-transparent px-1.5 font-normal'}
    >
      <span className={className}>{props.children}</span>
    </Badge>
  );
}

function Figure(props: React.PropsWithChildren) {
  return (
    <div className={'font-heading text-2xl font-semibold'}>
      {props.children}
    </div>
  );
}

function Trend(
  props: React.PropsWithChildren<{
    trend: 'up' | 'down' | 'stale';
  }>,
) {
  const Icon = useMemo(() => {
    switch (props.trend) {
      case 'up':
        return <ArrowUp className={'h-3 w-3 text-green-500'} />;
      case 'down':
        return <ArrowDown className={'text-destructive h-3 w-3'} />;
      case 'stale':
        return <Menu className={'h-3 w-3 text-orange-500'} />;
    }
  }, [props.trend]);

  return (
    <div>
      <BadgeWithTrend trend={props.trend}>
        <span className={'flex items-center space-x-1'}>
          {Icon}
          <span>{props.children}</span>
        </span>
      </BadgeWithTrend>
    </div>
  );
}

export function ReservationsChart({ data, label, desc }: { data: { name: string, value: number }[], label: string, desc: string }) {
  const chartConfig = {
    value: {
      label: label,
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>
          {desc}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer className={'h-64 w-full'} config={chartConfig}>
          <AreaChart accessibilityLayer data={data}>
            <defs>
              <linearGradient id="fillReservations" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => format(parseISO(value), 'dd MMM')}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillReservations)"
              fillOpacity={0.4}
              stroke="var(--chart-1)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function GuestsChart({ data, label, desc }: { data: { name: string, value: number }[], label: string, desc: string }) {
    const chartConfig = {
      value: {
        label: label,
        color: 'var(--chart-2)',
      },
    } satisfies ChartConfig;
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>{label}</CardTitle>
          <CardDescription>
            {desc}
          </CardDescription>
        </CardHeader>
  
        <CardContent>
          <ChartContainer className={'h-64 w-full'} config={chartConfig}>
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: string) => format(parseISO(value), 'dd MMM')}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="value" fill="var(--chart-2)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }
