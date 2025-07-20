'use client';

import PaymentForm from './PaymentForm';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StripeWrapper from './StripeWrapper';
import { clearCart } from '../lib/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '../lib/store';
import { createPaymentIntent, resetPayment } from '../store/slices/paymentSlice';

const translations = {
  orderDetails: {
    title: 'Order Details',
    total: 'Total',
    product: 'Product'
  },
  delivery: {
    title: 'Delivery Address',
    phone: 'Phone'
  },
  payment: {
    button: {
      processing: 'Processing...',
      proceed: 'Proceed to Payment'
    }
  },
  success: {
    title: 'Order Successfully Placed!',
    paymentComplete: 'Payment completed successfully.',
    preparation: 'Your order will be prepared shortly.',
    trackOrder: 'You can track your order status on the "My Orders" page.',
    autoClose: 'This window will close automatically...'
  },
  alerts: {
    loginRequired: 'Please login to continue',
    orderFailed: 'Order could not be created'
  }
};

interface OrderItem {
  food: string;
  quantity: number;
  price: number;
  isDiscount?: boolean;
  discount?: number;
  discountPrice?: number;
}

interface DeliveryAddress {
  street: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    items: OrderItem[];
    totalAmount: number;
    deliveryAddress: DeliveryAddress;
    paymentMethod: 'stripe' | 'cash';
  };
}

export default function CheckoutModal({ onClose, orderData }: CheckoutModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { clientSecret, isLoading, error, paymentStatus } = useAppSelector(state => state.payment);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [step, setStep] = useState<'order' | 'payment' | 'success'>('order');

  useEffect(() => {
    if (paymentStatus === 'succeeded') {
      setStep('success');
      setTimeout(() => {
        dispatch(clearCart());
        dispatch(resetPayment());
        onClose();
        setStep('order');
      }, 3000);
    }
  }, [paymentStatus, dispatch, onClose]);

  const createOrder = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        alert(translations.alerts.loginRequired);
        return;
      }

      const result = await dispatch(createPaymentIntent({
        amount: orderData.totalAmount,
        items: orderData.items,
        deliveryAddress: orderData.deliveryAddress,
        currency: 'usd'
      }));

      if (result.payload && result.payload.orderId) {
        setOrderId(result.payload.orderId);
      }

      setStep('payment');
    } catch (error) {
      alert(translations.alerts.orderFailed);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('success');
    setTimeout(() => {
      dispatch(clearCart());
      dispatch(resetPayment());
      onClose();
      setStep('order');
    }, 3000);
    router.push('/');
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment error: ${error}`);
  };
 
  return (
    <div className="w-full">
      <div className="bg-white rounded-xl w-full">
        <div className="p-6">
          {step === 'order' && (
            <div>
              <div className="mb-6 bg-gray-50 px-8 py-4 rounded-xl">
                <h3 className="font-medium mb-3">{translations.orderDetails.title}</h3>
                <div className="space-y-2">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {translations.orderDetails.product}</span>
                      <span>$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 font-medium">
                  <div className="flex justify-between">
                    <span>{translations.orderDetails.total}</span>
                    <span className="text-[#EA580C]">$ {orderData.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6 bg-gray-50 px-8 py-4 rounded-xl">
                <h3 className="font-medium mb-3">{translations.delivery.title}</h3>
                <div className="text-sm text-gray-600">
                  <p>{orderData.deliveryAddress.street}</p>
                  <p>{orderData.deliveryAddress.district}, {orderData.deliveryAddress.city}</p>
                  <p>{translations.delivery.phone}: {orderData.deliveryAddress.phone}</p>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={createOrder}
                disabled={isLoading}
                className="w-full bg-[#EA580C] text-white py-3 rounded-lg font-medium hover:bg-[#EA580C]/90 disabled:opacity-50"
              >
                <span className="text-white">
                  {isLoading ? translations.payment.button.processing : translations.payment.button.proceed}
                </span>
              </button>
            </div>
          )}

          {step === 'payment' && clientSecret && (
            <StripeWrapper clientSecret={clientSecret}>
              <PaymentForm
                amount={orderData.totalAmount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </StripeWrapper>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {translations.success.title}
              </h3>
              <p className="text-gray-600 mb-2">
                {translations.success.paymentComplete}
              </p>
              <p className="text-gray-600 mb-4">
                {translations.success.preparation}
              </p>
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                {translations.success.trackOrder}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                {translations.success.autoClose}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 