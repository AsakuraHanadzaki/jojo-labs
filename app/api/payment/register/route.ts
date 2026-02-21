import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  // === LOG ALL ENVIRONMENT VARIABLES AT START ===
  console.log('[v0] ========== PAYMENT REGISTER API CALLED ==========');
  console.log('[v0] ALL PAYMENT ENV VARS:', {
    // Arca variables
    ARCA_API_URL: process.env.ARCA_API_URL || 'MISSING',
    ARCA_USERNAME: process.env.ARCA_USERNAME || 'MISSING',
    ARCA_PASSWORD: process.env.ARCA_PASSWORD 
      ? `SET (${process.env.ARCA_PASSWORD.length} chars, first="${process.env.ARCA_PASSWORD[0]}", last="${process.env.ARCA_PASSWORD.slice(-1)}")`
      : 'MISSING',
    ARCA_RETURN_URL: process.env.ARCA_RETURN_URL || 'MISSING',
    // iPay variables
    IPAY_BASE_URL: process.env.IPAY_BASE_URL || 'MISSING',
    IPAY_USERNAME: process.env.IPAY_USERNAME || 'MISSING',
    IPAY_PASSWORD: process.env.IPAY_PASSWORD 
      ? `SET (${process.env.IPAY_PASSWORD.length} chars, first="${process.env.IPAY_PASSWORD[0]}", last="${process.env.IPAY_PASSWORD.slice(-1)}")`
      : 'MISSING',
    IPAY_RETURN_URL: process.env.IPAY_RETURN_URL || 'MISSING',
  });

  try {
    const body = await request.json();
    console.log('[v0] Request body received:', JSON.stringify(body, null, 2));

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
      console.log('[v0] Validation failed - missing orderNumber or amount');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Construct the exact URL
    const fullUrl = `${process.env.ARCA_API_URL}register.do`;
    console.log('[v0] Exact API URL being called:', fullUrl);

    // Build all request parameters
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

    // Log all request parameters (password redacted)
    console.log('[v0] All request parameters:', {
      userName: requestParams.userName,
      password: `[REDACTED - ${requestParams.password?.length || 0} chars, first="${requestParams.password?.[0]}", last="${requestParams.password?.slice(-1)}"]`,
      orderNumber: requestParams.orderNumber,
      amount: requestParams.amount,
      currency: requestParams.currency,
      returnUrl: requestParams.returnUrl,
      description: requestParams.description,
      language: requestParams.language,
      sessionTimeoutSecs: requestParams.sessionTimeoutSecs,
    });

    // Log the actual URL-encoded body being sent
    const encodedBody = new URLSearchParams(requestParams).toString();
    console.log('[v0] URL-encoded body (password redacted):', encodedBody.replace(/password=[^&]+/, 'password=[REDACTED]'));

    console.log('[v0] Sending POST request to Arca...');

    // Register payment with Arca
    const arcaResponse = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestParams),
    });

    console.log('[v0] Arca HTTP Response Status:', arcaResponse.status, arcaResponse.statusText);
    console.log('[v0] Arca Response Headers:', JSON.stringify(Object.fromEntries(arcaResponse.headers.entries()), null, 2));

    // Try to get the raw text first for debugging
    const rawResponseText = await arcaResponse.text();
    console.log('[v0] Arca Raw Response Body:', rawResponseText);

    // Parse the response as JSON
    let arcaData;
    try {
      arcaData = JSON.parse(rawResponseText);
    } catch (parseError) {
      console.error('[v0] Failed to parse Arca response as JSON:', parseError);
      console.error('[v0] Raw response was:', rawResponseText);
      return NextResponse.json(
        { error: 'Invalid response from payment gateway', rawResponse: rawResponseText },
        { status: 502 }
      );
    }

    console.log('[v0] Arca Parsed Response:', JSON.stringify(arcaData, null, 2));

    // Check for Arca errors
    if (arcaData.errorCode && arcaData.errorCode !== '0' && arcaData.errorCode !== 0) {
      console.error('[v0] ARCA ERROR - Registration failed:', {
        errorCode: arcaData.errorCode,
        errorMessage: arcaData.errorMessage,
        orderId: arcaData.orderId,
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

    console.log('[v0] ARCA SUCCESS - Payment registered:', {
      orderId: arcaData.orderId,
      formUrl: arcaData.formUrl,
    });

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
