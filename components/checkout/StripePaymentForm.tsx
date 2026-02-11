'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { Info } from 'lucide-react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export interface StripeFormHandle {
  submit: () => Promise<{ success: boolean; error?: string }>;
}

interface StripePaymentFormProps {
  amount: number; // in satang (smallest currency unit)
}

// ─── Inner form rendered inside <Elements> ──────────────────────────────

const CardForm = forwardRef<StripeFormHandle>(function CardForm(_props, ref) {
  const stripe = useStripe();
  const elements = useElements();
  const [isReady, setIsReady] = useState(false);
  const { t } = useLanguage();

  useImperativeHandle(ref, () => ({
    async submit() {
      if (!stripe || !elements) {
        return { success: false, error: 'Stripe not loaded' };
      }

      // 1. Validate card details
      const { error: submitError } = await elements.submit();
      if (submitError) {
        return { success: false, error: submitError.message };
      }

      // 2. Create PaymentIntent on server
      const res = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || 'Failed to create payment' };
      }

      const { clientSecret } = await res.json();

      // 3. Confirm payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/checkout',
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        return { success: false, error: confirmError.message };
      }

      return { success: true };
    },
  }));

  return (
    <div className="space-y-3">
      <PaymentElement
        onReady={() => setIsReady(true)}
        options={{
          layout: 'tabs',
        }}
      />
      {!isReady && (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
        </div>
      )}
      <div className="bg-amber-50 border border-amber-200 rounded-sm px-4 py-3">
        <p className="text-xs text-amber-700 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          {t.checkout.testCardHint}
        </p>
      </div>
    </div>
  );
});

// ─── Outer wrapper: loads Stripe + Elements ─────────────────────────────

export const StripePaymentForm = forwardRef<StripeFormHandle, StripePaymentFormProps>(
  function StripePaymentForm({ amount }, ref) {
    const cardFormRef = useRef<StripeFormHandle>(null);

    useImperativeHandle(ref, () => ({
      submit: () => cardFormRef.current!.submit(),
    }));

    return (
      <Elements
        key={amount}
        stripe={stripePromise}
        options={{
          mode: 'payment',
          amount,
          currency: 'thb',
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#292524',       // stone-800
              colorBackground: '#fafaf9',    // stone-50
              colorText: '#1c1917',          // stone-900
              colorDanger: '#e11d48',        // rose-600
              fontFamily: '"DM Sans", system-ui, sans-serif',
              borderRadius: '2px',
              spacingUnit: '4px',
            },
            rules: {
              '.Input': {
                border: '1px solid #d6d3d1',  // stone-300
                boxShadow: 'none',
                padding: '10px 12px',
              },
              '.Input:focus': {
                border: '1px solid #292524',
                boxShadow: 'none',
              },
              '.Label': {
                fontSize: '12px',
                fontWeight: '500',
                letterSpacing: '0.025em',
                color: '#57534e',              // stone-600
              },
            },
          },
        }}
      >
        <CardForm ref={cardFormRef} />
      </Elements>
    );
  }
);
