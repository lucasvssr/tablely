import { Trans } from '@kit/ui/trans';

export default function HowItWorksSection() {
    return (
        <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((step) => (
                <div key={step} className="relative space-y-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-copper text-white font-bold">
                        {step}
                    </div>
                    <h3 className="font-heading text-xl font-bold text-zinc-900 dark:text-white">
                        <Trans i18nKey={`home:step${step}Title`} />
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                        <Trans i18nKey={`home:step${step}Description`} />
                    </p>
                </div>
            ))}
        </div>
    );
}
