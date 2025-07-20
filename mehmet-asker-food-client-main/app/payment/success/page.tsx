'use client';

import { useEffect, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPayment } from '../../../store/slices/paymentSlice';
import paymentTranslations from '../../lib/translations/customer/paymentSuccessPage.json';

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const handlePaymentSuccess = async () => {
            const paymentIntent = searchParams.get('payment_intent');

            if (paymentIntent) {
                try {
                    await dispatch(confirmPayment(paymentIntent)).unwrap();
                    router.push('/cart?step=confirmation');
                } catch (error) {
                    router.push('/cart?error=payment_failed');
                }
            }
        };

        handlePaymentSuccess();
    }, [dispatch, router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA580C] mx-auto mb-4"></div>
                <p className="text-gray-600">{paymentTranslations.loading.title}</p>
            </div>
        </div>
    );
}

export default function PaymentSuccess() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA580C] mx-auto mb-4"></div>
                        <p className="text-gray-600">{paymentTranslations.loading.title}</p>
                    </div>
                </div>
            }
        >
            <PaymentSuccessContent />
        </Suspense>
    );
}