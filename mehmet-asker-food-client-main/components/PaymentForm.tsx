'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const translations = {
  payment: {
    title: 'Payment Information',
    amount: 'Amount to pay',
    button: {
      processing: 'Processing...',
      pay: 'Pay'
    }
  },
  errors: {
    default: 'An unexpected error occurred',
    payment: 'An error occurred during payment'
  },
  success: {
    payment: 'Payment successful!'
  },
  footer: {
    secure: 'Secure payment provided by Stripe'
  }
};

interface PaymentFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  amount: number;
}

export default function PaymentForm({ onSuccess, onError, amount }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || translations.errors.payment);
        onError?.(error.message || translations.errors.payment);
      } else {
        setMessage(translations.errors.default);
        onError?.(translations.errors.default);
      }
    } else {
      setMessage(translations.success.payment);
      onSuccess?.();
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{translations.payment.title}</h3>
        <p className="text-sm text-gray-600">
          {translations.payment.amount}: <span className="font-medium">${amount.toFixed(2)}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <PaymentElement
            options={{
              layout: 'tabs'
            }}
          />
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded text-sm ${message === translations.success.payment
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="w-full bg-[#EA580C] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#EA580C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-white">
            {isLoading ? translations.payment.button.processing : `${translations.payment.button.pay} $ ${amount.toFixed(2)}`}
          </span>
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>{translations.footer.secure}</p>
      </div>
    </div>
  );
} 