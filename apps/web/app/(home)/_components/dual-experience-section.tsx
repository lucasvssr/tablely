import { Trans } from '@kit/ui/trans';

export default function DualExperienceSection() {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <div className="group relative flex flex-col space-y-6 overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="absolute right-0 top-0 h-48 w-48 translate-x-12 -translate-y-12 rounded-full bg-[radial-gradient(circle,rgba(var(--brand-copper-rgb),0.05)_0%,transparent_70%)] transition-all group-hover:bg-[radial-gradient(circle,rgba(var(--brand-copper-rgb),0.1)_0%,transparent_70%)]" />

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-copper/10 text-brand-copper">
                    <span className="font-heading font-bold text-xl">J.</span>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-copper-foreground">
                            <Trans i18nKey={'home:clientExperienceLabel'} />
                        </span>
                        <h3 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">
                            <Trans i18nKey={'home:clientExperienceTitle'} />
                        </h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-sans">
                        <Trans i18nKey={'home:clientExperienceDescription'} />
                    </p>
                </div>
                <ul className="grid gap-4 pt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {[
                        'home:clientFeature1',
                        'home:clientFeature2',
                        'home:clientFeature3',
                    ].map((key, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-copper/10 text-brand-copper">
                                <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <span className="font-medium">
                                <Trans i18nKey={key} />
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="group relative flex flex-col space-y-6 overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-100 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950/50">
                <div className="absolute right-0 top-0 h-48 w-48 translate-x-12 -translate-y-12 rounded-full bg-[radial-gradient(circle,rgba(113,113,122,0.05)_0%,transparent_70%)] transition-all group-hover:bg-[radial-gradient(circle,rgba(113,113,122,0.1)_0%,transparent_70%)]" />

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-white/5">
                    <span className="font-heading font-bold text-xl">T.</span>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            <Trans i18nKey={'home:proExperienceLabel'} />
                        </span>
                        <h3 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">
                            <Trans i18nKey={'home:proExperienceTitle'} />
                        </h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-sans">
                        <Trans i18nKey={'home:proExperienceDescription'} />
                    </p>
                </div>
                <ul className="grid gap-4 pt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {[
                        'home:proFeature1',
                        'home:proFeature2',
                        'home:proFeature3',
                    ].map((key, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                <Trans i18nKey={key} />
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
