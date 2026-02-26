import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
  width,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <div
      style={{ width }}
      className={cn(
        'flex items-center gap-2 transition-all hover:opacity-80 group-data-[state=collapsed]:gap-0 group-data-[state=collapsed]:justify-center',
        className,
      )}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-copper font-heading font-black text-white dark:text-black shadow-lg shadow-brand-copper/20 dark:shadow-none transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500">
        T.
      </div>
      <span className="font-heading text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white whitespace-nowrap group-data-[state=collapsed]:hidden transition-all duration-200">
        Tablely
      </span>
    </div>
  );
}

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} />
    </Link>
  );
}
