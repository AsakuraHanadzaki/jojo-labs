import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { ehdmService } from '@/lib/ehdm-service';

/**
 * Process order refund and register with E-HDM tax system
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, products, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServerClient();

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order was fiscalized
    if (!order.ehdm_receipt_id) {
      return NextResponse.json(
        { error: 'Order was not fiscalized, cannot process E-HDM refund' },
        { status: 400 }
      );
    }

    // Fetch order items for refund
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: 'No order items found' },
        { status: 400 }
      );
    }

    // Determine which products to refund
    let refundProducts;
    let refundAmount = order.total;

    if (products && products.length > 0) {
      // Partial refund - specific products
      refundProducts = products.map((p: { receiptProductId: number; quantity: number }) => ({
        receiptProductId: p.receiptProductId,
        quantity: p.quantity,
      }));
      
      // Calculate partial refund amount
      refundAmount = products.reduce((sum: number, p: { receiptProductId: number; quantity: number }) => {
        const item = orderItems[p.receiptProductId];
        return sum + (item ? item.unit_price * p.quantity : 0);
      }, 0);
    } else {
      // Full refund - all products
      refundProducts = orderItems.map((item, index) => ({
        receiptProductId: index,
        quantity: item.quantity,
      }));
    }

    // Get history ID from the stored receipt
    // Note: You may need to call GetHistoryByReceiptId first to get the historyId
    // For now, we'll use the receipt ID as the history ID
    const historyId = order.ehdm_receipt_id;

    // Process refund with E-HDM
    const ehdmResponse = await ehdmService.reverseReceipt({
      historyId,
      products: refundProducts,
      cashAmount: 0,  // Online refund = no cash
      cardAmount: refundAmount,
    });

    if (!ehdmResponse) {
      return NextResponse.json(
        { error: 'E-HDM refund processing failed' },
        { status: 500 }
      );
    }

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: products ? 'partially_refunded' : 'refunded',
        payment_status: products ? 'partially_refunded' : 'refunded',
        ehdm_refund_receipt_id: ehdmResponse.res?.receiptId,
        ehdm_refund_receipt_url: ehdmResponse.reverceLink || ehdmResponse.link,
        refund_reason: reason,
        refund_amount: refundAmount,
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      receiptId: ehdmResponse.res?.receiptId,
      receiptUrl: ehdmResponse.reverceLink || ehdmResponse.link,
      refundAmount,
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
