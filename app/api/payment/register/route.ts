import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      orderNumber, 
      amount, 
      description, 
      customerName, 
      customerEmail,
      customerPhone 
    } = body;

    // Validate required fields
    if (!orderNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Debug: Check environment variables are present
    console.log('[v0] ARCA_API_URL:', process.env.ARCA_API_URL ? 'set' : 'MISSING');
    console.log('[v0] ARCA_USERNAME:', process.env.ARCA_USERNAME ? 'set' : 'MISSING');
    console.log('[v0] ARCA_PASSWORD:', process.env.ARCA_PASSWORD ? 'set' : 'MISSING');
    console.log('[v0] ARCA_RETURN_URL:', process.env.ARCA_RETURN_URL ? 'set' : 'MISSING');
    console.log('[v0] Registering payment for order:', orderNumber, 'amount:', amount);

    // Register payment with Arca
    const arcaResponse = await fetch(
      `${process.env.ARCA_API_URL}register.do`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          userName: process.env.ARCA_USERNAME!,
          password: process.env.ARCA_PASSWORD!,
          orderNumber: orderNumber,
          amount: amount.toString(), // Amount in minor units (no decimals)
          currency: '051', // AMD (Armenian Dram)
          returnUrl: `${process.env.ARCA_RETURN_URL}`,
          description: description || `Order ${orderNumber}`,
          language: 'en',
          sessionTimeoutSecs: '1200', // 20 minutes
        }),
      }
    );

    const arcaData = await arcaResponse.json();

    // Check for Arca errors
    if (arcaData.errorCode && arcaData.errorCode !== '0' && arcaData.errorCode !== 0) {
      console.error('Arca registration error:', arcaData);
      return NextResponse.json(
        { 
          error: arcaData.errorMessage || 'Payment registration failed',
          errorCode: arcaData.errorCode 
        },
        { status: 400 }
      );
    }

    // Update order with Arca order ID
    const supabase = await getSupabaseServerClient();
    await supabase
      .from('orders')
      .update({ 
        arca_order_id: arcaData.orderId,
        payment_status: 'pending',
        arca_payment_status: 0
      })
      .eq('order_number', orderNumber);

    return NextResponse.json({
      success: true,
      orderId: arcaData.orderId,
      formUrl: arcaData.formUrl,
    });

  } catch (error) {
    console.error('Payment registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
