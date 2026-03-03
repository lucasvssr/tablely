import { getRestaurantsAction } from '~/lib/server/restaurant/restaurant-actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import Link from 'next/link';
import { MapPin, Phone, ArrowRight, Utensils } from 'lucide-react';
import { Trans } from '@kit/ui/trans';

export async function RestaurantPreviewSection() {
    const allRestaurants = await getRestaurantsAction();
    // Shuffle randomly (Fisher-Yates) then pick 3 to feature
    const shuffled = [...allRestaurants].sort(() => Math.random() - 0.5);
    const restaurants = shuffled.slice(0, 3);

    if (restaurants.length === 0) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 md:px-6 space-y-12 py-16">
            <div className="flex flex-col items-center space-y-4 text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
                    <Trans i18nKey="home:restaurantPreviewHeading" defaults="Nos établissements partenaires" />
                </h2>
                <p className="max-w-2xl text-muted-foreground">
                    <Trans i18nKey="home:restaurantPreviewSubtitle" defaults="Découvrez une sélection de restaurants qui nous font confiance pour leur gestion quotidienne." />
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {restaurants.map((restaurant) => (
                    <RestaurantPreviewCard key={restaurant.id} restaurant={restaurant} />
                ))}
            </div>

            <div className="flex justify-center pt-4">
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                    <Link href="/restaurants">
                        <Trans i18nKey="home:viewAllRestaurants" defaults="Voir tous les restaurants" />
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

interface RestaurantPreview {
    id: string;
    name: string;
    location: string;
    phone: string;
    slug: string;
}

function RestaurantPreviewCard({ restaurant }: { restaurant: RestaurantPreview }) {
    return (
        <Card className="overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border-zinc-200/50 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm group">
            <div className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-copper/5 to-orange-500/5 group-hover:scale-110 transition-transform duration-500">
                    <Utensils className="h-16 w-16 text-brand-copper/10" />
                </div>
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-xl group-hover:text-brand-copper transition-colors">{restaurant.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                <div className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-brand-copper/70" />
                    <span className="line-clamp-2">{restaurant.location}</span>
                </div>
                {restaurant.phone && (
                    <div className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                        <Phone className="h-4 w-4 shrink-0 text-brand-copper/70" />
                        <span>{restaurant.phone}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-0 pb-6 px-6">
                <Button asChild className="w-full bg-brand-copper hover:bg-brand-copper/90 shadow-md shadow-brand-copper/10 transition-all active:scale-95">
                    <Link href={`/restaurant/${restaurant.slug}`}>
                        <Trans i18nKey="home:bookNow" defaults="Réserver maintenant" />
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
