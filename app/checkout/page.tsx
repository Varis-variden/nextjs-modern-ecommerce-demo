import { Suspense } from 'react';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';

function CheckoutSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-pulse">
      <div className="h-4 w-24 bg-stone-200 rounded mb-4" />
      <div className="h-8 w-48 bg-stone-200 rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white border border-stone-200 rounded-sm p-6">
            <div className="h-4 w-36 bg-stone-200 rounded mb-4" />
            <div className="h-24 bg-stone-100 rounded" />
          </div>
          <div className="bg-white border border-stone-200 rounded-sm p-6">
            <div className="h-4 w-36 bg-stone-200 rounded mb-4" />
            <div className="h-16 bg-stone-100 rounded" />
          </div>
          <div className="bg-white border border-stone-200 rounded-sm p-6">
            <div className="h-4 w-36 bg-stone-200 rounded mb-4" />
            <div className="h-20 bg-stone-100 rounded" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="border border-stone-200 rounded-sm p-5 space-y-4">
            <div className="h-4 w-28 bg-stone-200 rounded" />
            <div className="h-16 bg-stone-100 rounded" />
            <div className="h-16 bg-stone-100 rounded" />
            <div className="h-12 bg-stone-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutRoute() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutPage />
    </Suspense>
  );
}
