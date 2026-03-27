import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { ehdmService, EHDMService } from '@/lib/ehdm-service';

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
      // Payment successful - first update order status
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

      // Fetch order details for E-HDM fiscalization
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('arca_order_id', orderId)
        .single();

      if (order) {
        // Fetch order items
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        // Register with E-HDM (Armenian tax authority)
        if (orderItems && orderItems.length > 0) {
          try {
            const ehdmProducts = EHDMService.convertOrderItemsToEHDMProducts(orderItems);
            const uniqueCode = EHDMService.generateUniqueCode(order.id);
            
            // Determine payment type (card for online payments)
            const ehdmResponse = await ehdmService.printReceipt({
              products: ehdmProducts,
              cashAmount: 0,  // Online payment = no cash
              cardAmount: order.total,
              uniqueCode,
            });

            if (ehdmResponse) {
              // Store E-HDM receipt info in order
              await supabase
                .from('orders')
                .update({
                  ehdm_receipt_id: ehdmResponse.res?.receiptId,
                  ehdm_receipt_url: ehdmResponse.link,
                  ehdm_unique_code: uniqueCode,
                  ehdm_fiscalized_at: new Date().toISOString(),
                })
                .eq('id', order.id);
              
              console.log('[E-HDM] Order fiscalized successfully:', order.id);
            } else {
              console.error('[E-HDM] Fiscalization failed for order:', order.id);
              // Note: We don't fail the payment if fiscalization fails
              // The order is still valid, fiscalization can be retried
            }
          } catch (ehdmError) {
            console.error('[E-HDM] Error during fiscalization:', ehdmError);
            // Continue with successful payment even if fiscalization fails
          }
        }
      }

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
