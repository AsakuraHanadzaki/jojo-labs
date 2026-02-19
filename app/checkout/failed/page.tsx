"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeaderWithSearch } from '@/components/header-with-search';
import { Footer } from '@/components/footer';

function FailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason');
  const error = searchParams.get('error');

  const getMessage = () => {
    if (error === 'missing_order_id') {
      return 'Payment session expired or invalid.';
    }
    if (error === 'system_error') {
      return 'A system error occurred. Please try again.';
    }
    if (reason) {
      return reason;
    }
    return 'Your payment could not be processed.';
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderWithSearch />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="rounded-3xl text-center">
          <CardHeader className="space-y-6 pb-8">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <CardTitle className="text-3xl">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">{getMessage()}</p>
            {orderId && (
              <p className="text-sm text-gray-500">Order ID: {orderId}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/checkout">Try Again</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FailedContent />
    </Suspense>
  );
}
