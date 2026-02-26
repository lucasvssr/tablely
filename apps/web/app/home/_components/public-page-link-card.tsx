'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Globe, Copy, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import pathsConfig from '~/config/paths.config';

export function PublicPageLinkCard({ slug }: { slug: string }) {
    const [baseUrl, setBaseUrl] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const url = `${baseUrl}${pathsConfig.app.restaurant}/${slug}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Lien copié dans le presse-papier');
        setTimeout(() => setCopied(false), 2000);
    };

    if (!baseUrl) return null;

    return (
        <Card className="border-blue-100 bg-linear-to-br from-blue-50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/5 dark:border-blue-900/50 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Globe className="h-24 w-24 text-blue-600 dark:text-blue-400" />
            </div>

            <CardHeader className="pb-3 relative z-10">
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100 font-bold text-xl">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <Globe className="h-5 w-5" />
                    </div>
                    Votre page de réservation
                </CardTitle>
                <CardDescription className="text-blue-700/70 dark:text-blue-300/60 max-w-[80%]">
                    Partagez ce lien avec vos clients sur les réseaux sociaux ou votre site web pour recevoir des réservations.
                </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="flex items-center gap-2 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-blue-200 dark:border-blue-800 rounded-xl mb-6 shadow-sm group transition-all hover:border-blue-400 dark:hover:border-blue-600">
                    <code className="flex-1 text-sm font-medium truncate text-slate-600 dark:text-slate-400 px-2">
                        {url}
                    </code>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="rounded-lg h-9 w-9 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-blue-600" />}
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="default"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-xl shadow-lg shadow-blue-600/20"
                        asChild
                    >
                        <a href={`${pathsConfig.app.restaurant}/${slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Voir ma page publique
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
