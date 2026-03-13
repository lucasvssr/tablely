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
      style={{ '--logo-width': `${width}px` } as React.CSSProperties}
      className={cn(
        'relative flex items-center justify-center transition-all hover:opacity-80 w-[var(--logo-width)] group-data-[state=collapsed]:w-auto group-data-[state=collapsed]:justify-center',
        className,
      )}
    >
      <Image
        src="/images/logo.svg"
        alt="Tablely Logo"
        width={733}
        height={272}
        className="block dark:hidden group-data-[state=collapsed]:hidden w-auto h-full object-contain max-h-[55px]"
        priority
      />
      <Image
        src="/images/logo-dark.svg"
        alt="Tablely Logo"
        width={733}
        height={272}
        className="hidden dark:block group-data-[state=collapsed]:hidden w-auto h-full object-contain max-h-[55px]"
        priority
      />
      <Image
        src="/images/favicon/android-chrome-192x192.png"
        alt="Tablely Logo"
        width={48}
        height={48}
        className="hidden group-data-[state=collapsed]:block w-10 h-10 object-contain"
        priority
      />
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
