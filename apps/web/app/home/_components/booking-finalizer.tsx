'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createReservationAction } from '~/lib/server/restaurant/restaurant-actions';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function BookingFinalizer() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const processedRef = useRef(false);
    const { t } = useTranslation('public');

    useEffect(() => {
        const confirmBooking = searchParams.get('confirm_booking');

        if (confirmBooking === 'true' && !processedRef.current) {
            const pending = localStorage.getItem('pending_booking');

            if (pending) {
                try {
                    const data = JSON.parse(pending);


                    processedRef.current = true;

                    // Finalize the booking
                    const finalize = async () => {
                        try {
                            const result = await createReservationAction(data) as { success?: boolean; error?: string };
                            
                            if (result?.error) {
                                throw new Error(result.error);
                            }


                            toast.success(t('public:booking.successTitle'));

                            // Clean up
                            localStorage.removeItem('pending_booking');

                            // Remove param from URL
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('confirm_booking');
                            const queryString = params.toString();
                            const newUrl = window.location.pathname + (queryString ? `?${queryString}` : '');
                            router.replace(newUrl, { scroll: false });
                        } catch (error) {

                            toast.error(error instanceof Error ? error.message : t('public:booking.errorGeneric'));
                        }
                    };

                    finalize();
                } catch (error) {
                    console.error('Error parsing pending booking:', error);
                }
            }
        }
    }, [searchParams, router, t]);

    return null;
}
