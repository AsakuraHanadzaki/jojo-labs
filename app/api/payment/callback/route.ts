import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.redirect(
        new URL('/checkout/failed?error=missing_order_id', request.url)
      );
    }

    // Check payment status with Arca
    const statusResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/status?orderId=${orderId}`,
      { cache: 'no-store' }
    );

    if (!statusResponse.ok) {
      throw new Error('Failed to check payment status');
    }

    const statusData = await statusResponse.json();

    // Update order in database
    const supabase = await getSupabaseServerClient();
    
    // Order status codes from Arca:
    // 0 = Registered but not paid
    // 1 = Pre-authorized (two-stage payment)
    // 2 = Fully authorized and deposited (SUCCESS)
    // 3 = Authorization cancelled
    // 4 = Refunded
    // 6 = Authorization declined

    if (statusData.orderStatus === 2) {
      // Payment successful
      await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          arca_payment_status: 2,
          arca_action_code: statusData.actionCode,
          payment_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('arca_order_id', orderId);

      return NextResponse.redirect(
        new URL(`/checkout/success?orderId=${orderId}`, request.url)
      );
    } else {
      // Payment failed or declined
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          arca_payment_status: statusData.orderStatus,
          arca_action_code: statusData.actionCode,
          updated_at: new Date().toISOString(),
        })
        .eq('arca_order_id', orderId);

      return NextResponse.redirect(
        new URL(
          `/checkout/failed?orderId=${orderId}&reason=${encodeURIComponent(statusData.actionCodeDescription || 'Payment declined')}`,
          request.url
        )
      );
    }

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL('/checkout/failed?error=system_error', request.url)
    );
  }
}
