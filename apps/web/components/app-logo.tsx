import Link from 'next/link';
import Image from 'next/image';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
  width = 140,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <div
      style={{ width }}
      className={cn(
        'relative flex items-center transition-all hover:opacity-80 group-data-[state=collapsed]:justify-center',
        className,
      )}
    >
      <Image
        src="/images/logo.svg"
        alt="Tablely Logo"
        width={733}
        height={272}
        className="block dark:hidden group-data-[state=collapsed]:hidden w-full h-auto object-contain"
        priority
      />
      <Image
        src="/images/logo-dark.svg"
        alt="Tablely Logo"
        width={733}
        height={272}
        className="hidden dark:block group-data-[state=collapsed]:hidden w-full h-auto object-contain"
        priority
      />
      <div className="hidden group-data-[state=collapsed]:flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-copper font-heading font-black text-white dark:text-black shadow-lg shadow-brand-copper/20 dark:shadow-none transition-transform hover:scale-110 duration-500">
        T.
      </div>
    </div>
  );
}

export function AppLogo({
  href,
  label,
  className,
  width,
}: {
  href?: string | null;
  className?: string;
  label?: string;
  width?: number;
}) {
  if (href === null) {
    return <LogoImage className={className} width={width} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} width={width} />
    </Link>
  );
}
