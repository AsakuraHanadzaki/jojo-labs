import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { ehdmService, EHDMService } from '@/lib/ehdm-service';
import type { Order, OrderItem } from '@/lib/supabase/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.redirect(
        new URL('/checkout/failed?error=missing_order_id', request.url)
      );
    }

    const statusResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/status?orderId=${orderId}`,
      { cache: 'no-store' }
    );

    if (!statusResponse.ok) {
      throw new Error('Failed to check payment status');
    }

    const statusData = await statusResponse.json();
    const supabase = await getSupabaseServerClient();

    if (statusData.orderStatus === 2) {
      await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          admin_notes: `Arca action code: ${statusData.actionCode || 'N/A'}`,
          updated_at: new Date().toISOString(),
        })
        .eq('tracking_number', orderId);

      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_number', orderId)
        .single() as { data: Order | null };

      if (order) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id) as { data: OrderItem[] | null };

        if (orderItems && orderItems.length > 0) {
          try {
            const { data: products } = await supabase
              .from('products')
              .select('id, numeric_id, name')
              .in('id', orderItems.map(i => i.product_id));

            const productMap: Record<string, { numeric_id: number; name: string }> = {};
            for (const p of products || []) {
              productMap[p.id] = { numeric_id: p.numeric_id, name: p.name };
            }

            const itemsWithNumericId = orderItems.map(i => ({
              ...i,
              numeric_id: productMap[i.product_id]?.numeric_id,
              product_name: i.product_name || productMap[i.product_id]?.name || i.product_id,
            }));

            const ehdmProducts = EHDMService.convertOrderItemsToEHDMProducts(itemsWithNumericId);
            const uniqueCode = EHDMService.generateUniqueCode(order.id);

            const ehdmResponse = await ehdmService.printReceipt({
              products: ehdmProducts,
              cashAmount: 0,
              cardAmount: order.total,
              uniqueCode,
            });

            if (ehdmResponse) {
              const receiptId = ehdmResponse.res?.receiptId;

              await supabase
                .from('orders')
                .update({
                  ehdm_receipt_id: receiptId,
                  ehdm_receipt_url: ehdmResponse.link,
                  ehdm_unique_code: uniqueCode,
                  ehdm_fiscalized_at: new Date().toISOString(),
                })
                .eq('id', order.id);

              if (receiptId) {
                const history = await ehdmService.getHistoryByReceiptId(receiptId);
                const historyId = history?.id ?? 0;

                await ehdmService.sendEmail(historyId, receiptId, order.customer_email, 1);

                const adminEmails = (process.env.EHDM_NOTIFY_EMAILS || 'akarabadzhakian@gmail.com,infojojolabs@gmail.com').split(',');
                for (const email of adminEmails) {
                  await ehdmService.sendEmail(historyId, receiptId, email.trim(), 1);
                }
              }
            }
          } catch (ehdmError) {
            console.error('[E-HDM] Error during fiscalization:', ehdmError);
          }
        }
      }

      return NextResponse.redirect(
        new URL(`/checkout/success?orderId=${orderId}`, request.url)
      );
    } else {
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          admin_notes: `Arca status: ${statusData.orderStatus}, action code: ${statusData.actionCode || 'N/A'}`,
          updated_at: new Date().toISOString(),
        })
        .eq('tracking_number', orderId);

      return NextResponse.redirect(
        new URL(
          `/checkout/failed?orderId=${orderId}&reason=${encodeURIComponent(statusData.actionCodeDescription || 'Payment declined')}`,
          request.url
        )
      );
    }

  } catch (error) {
    console.error('[E-HDM] Callback error:', error);
    return NextResponse.redirect(
      new URL('/checkout/failed?error=system_error', request.url)
    );
  }
}
