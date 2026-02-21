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

    // Detailed debug logging for Arca request
    const fullUrl = `${process.env.ARCA_API_URL}register.do`;
    const requestParams = {
      userName: process.env.ARCA_USERNAME!,
      password: process.env.ARCA_PASSWORD!,
      orderNumber: orderNumber,
      amount: amount.toString(),
      currency: '051',
      returnUrl: `${process.env.ARCA_RETURN_URL}`,
      description: description || `Order ${orderNumber}`,
      language: 'en',
      sessionTimeoutSecs: '1200',
    };

    console.log('[v0] Arca Request Details:', {
      url: fullUrl,
      username: process.env.ARCA_USERNAME,
      passwordLength: process.env.ARCA_PASSWORD?.length,
      passwordFirstChar: process.env.ARCA_PASSWORD?.[0],
      passwordLastChar: process.env.ARCA_PASSWORD?.slice(-1),
    });
    console.log('[v0] Arca Environment Variables:', {
      ARCA_API_URL: process.env.ARCA_API_URL || 'MISSING',
      ARCA_USERNAME: process.env.ARCA_USERNAME || 'MISSING',
      ARCA_PASSWORD_SET: process.env.ARCA_PASSWORD ? `YES (${process.env.ARCA_PASSWORD.length} chars)` : 'MISSING',
      ARCA_RETURN_URL: process.env.ARCA_RETURN_URL || 'MISSING',
    });
    console.log('[v0] Arca Request Parameters:', {
      ...requestParams,
      password: `[REDACTED - ${requestParams.password?.length} chars]`,
    });

    // Register payment with Arca
    const arcaResponse = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestParams),
    });

    const arcaData = await arcaResponse.json();

    // Log full Arca response
    console.log('[v0] Arca Response Status:', arcaResponse.status);
    console.log('[v0] Arca Response Headers:', Object.fromEntries(arcaResponse.headers.entries()));
    console.log('[v0] Arca Response Body:', JSON.stringify(arcaData, null, 2));

    // Check for Arca errors
    if (arcaData.errorCode && arcaData.errorCode !== '0' && arcaData.errorCode !== 0) {
      console.error('[v0] Arca registration error:', {
        errorCode: arcaData.errorCode,
        errorMessage: arcaData.errorMessage,
        fullResponse: arcaData,
      });
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
