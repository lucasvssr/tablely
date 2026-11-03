import localFont from 'next/font/local';

const sans = localFont({
  src: './fonts/inter-variable.woff2',
  variable: '--font-sans',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
});

const heading = localFont({
  src: [
    {
      path: './fonts/Outfit-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Outfit-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-heading',
  fallback: ['system-ui', 'Helvetica Neue', 'Helvetica', 'Arial'],
  display: 'swap',
  preload: true,
});

export { heading, sans };