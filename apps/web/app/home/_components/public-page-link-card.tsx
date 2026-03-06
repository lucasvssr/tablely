'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Globe, Copy, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import pathsConfig from '~/config/paths.config';

export function PublicPageLinkCard({ slug }: { slug: string }) {
    const { t } = useTranslation('dashboard');
    const [baseUrl, setBaseUrl] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const url = `${baseUrl}${pathsConfig.app.restaurant}/${slug}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success(t('dashboard:publicPageCard.copySuccess'));
        setTimeout(() => setCopied(false), 2000);
    };

    if (!baseUrl) return null;

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-linear-to-br from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Globe className="h-24 w-24 text-brand-copper" />
            </div>

            <CardHeader className="pb-3 relative z-10">
                <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xl">
                    <div className="p-2 bg-brand-copper rounded-lg text-white">
                        <Globe className="h-5 w-5" />
                    </div>
                    {t('dashboard:publicPageCard.title')}
                </CardTitle>
                <CardDescription className="text-muted-foreground max-w-[80%]">
                    {t('dashboard:publicPageCard.description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="flex items-center gap-2 p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-xl mb-6 shadow-sm group transition-all hover:border-brand-copper/50 dark:hover:border-brand-copper/50">
                    <code className="flex-1 text-sm font-medium truncate text-zinc-600 dark:text-zinc-400 px-2">
                        {url}
                    </code>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="rounded-lg h-9 w-9 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title={t('dashboard:publicPageCard.copyButton')}
                    >
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-brand-copper" />}
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="default"
                        className="flex-1 bg-brand-copper hover:bg-brand-copper/90 text-white font-semibold h-11 rounded-xl shadow-lg shadow-brand-copper/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        asChild
                    >
                        <a href={`${pathsConfig.app.restaurant}/${slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {t('dashboard:publicPageCard.viewPage')}
                        </a>
                    </Button>

                    <Button
                        variant="outline"
                        onClick={copyToClipboard}
                        className="flex-1 border-brand-copper/20 text-zinc-600 dark:text-zinc-400 hover:bg-brand-copper/5 hover:text-brand-copper h-11 rounded-xl transition-all"
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        {t('dashboard:publicPageCard.copyButton')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
