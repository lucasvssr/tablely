'use client';

import dynamic from 'next/dynamic';

const GlobalLoader = dynamic(
    () => import('@kit/ui/global-loader').then((mod) => mod.GlobalLoader),
    {
        ssr: false,
    },
);

export default GlobalLoader;
