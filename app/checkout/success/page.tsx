"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeaderWithSearch } from '@/components/header-with-search';
import { Footer } from '@/components/footer';
import { useTranslation } from '@/hooks/use-translation';

function SuccessContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      // Fetch final order status
      fetch(`/api/payment/status?orderId=${orderId}`)
        .then((res) => res.json())
        .then((data) => setOrderDetails(data))
        .catch((err) => console.error('Failed to fetch order details:', err));
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-white">
      <HeaderWithSearch />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="rounded-3xl text-center">
          <CardHeader className="space-y-6 pb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Order Placed Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">
              Thank you for your order. We've received your payment and will process your order shortly. 
              You'll receive a confirmation email with your order details and tracking information.
            </p>
            {orderDetails && (
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Order Number:</span> {orderDetails.orderNumber}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Amount:</span> AMD {(orderDetails.amount / 100).toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  <span className="font-medium">Status:</span> {orderDetails.actionCodeDescription}
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/profile">View My Orders</Link>
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
