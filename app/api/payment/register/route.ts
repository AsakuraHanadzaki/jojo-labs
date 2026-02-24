import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  // === HELPER: Detect hidden characters and encoding issues ===
  function inspectString(label: string, value: string | undefined) {
    if (!value) {
      console.log(`[v0] ${label}: MISSING/UNDEFINED`);
      return;
    }
    const trimmed = value.trim();
    const hasLeadingSpace = value !== value.trimStart();
    const hasTrailingSpace = value !== value.trimEnd();
    const hasNewline = /[\r\n]/.test(value);
    const hasTab = /\t/.test(value);
    const hasNonASCII = /[^\x20-\x7E]/.test(value);
    const hasNullByte = /\0/.test(value);
    const hasQuotes = /^["']|["']$/.test(value);
    const charCodes = Array.from(value).map(c => c.charCodeAt(0));
    const byteLength = new TextEncoder().encode(value).length;

    console.log(`[v0] ${label}:`, {
      value_length: value.length,
      byte_length: byteLength,
      trimmed_length: trimmed.length,
      has_leading_space: hasLeadingSpace,
      has_trailing_space: hasTrailingSpace,
      has_newline: hasNewline,
      has_tab: hasTab,
      has_non_ascii: hasNonASCII,
      has_null_byte: hasNullByte,
      has_surrounding_quotes: hasQuotes,
      first_3_char_codes: charCodes.slice(0, 3),
      last_3_char_codes: charCodes.slice(-3),
      first_char: JSON.stringify(value[0]),
      last_char: JSON.stringify(value[value.length - 1]),
      value_preview: label.includes('PASSWORD') 
        ? `[REDACTED ${value.length} chars]` 
        : value.length > 50 ? value.slice(0, 25) + '...' + value.slice(-25) : value,
    });

    if (hasLeadingSpace || hasTrailingSpace || hasNewline || hasTab || hasNonASCII || hasNullByte || hasQuotes) {
      console.warn(`[v0] WARNING: ${label} has encoding issues!`, {
        hasLeadingSpace,
        hasTrailingSpace,
        hasNewline,
        hasTab,
        hasNonASCII,
        hasNullByte,
        hasQuotes,
        all_char_codes: label.includes('PASSWORD') ? '[REDACTED]' : charCodes,
      });
    }
  }

  // === LOG ALL ENVIRONMENT VARIABLES AT START ===
  console.log('[v0] ========== PAYMENT REGISTER API CALLED ==========');
  
  // Inspect each env var for hidden characters
  inspectString('ARCA_API_URL', process.env.ARCA_API_URL);
  inspectString('ARCA_USERNAME', process.env.ARCA_USERNAME);
  inspectString('ARCA_PASSWORD', process.env.ARCA_PASSWORD);
  inspectString('ARCA_RETURN_URL', process.env.ARCA_RETURN_URL);

  console.log('[v0] ALL PAYMENT ENV VARS:', {
    ARCA_API_URL: process.env.ARCA_API_URL || 'MISSING',
    ARCA_USERNAME: process.env.ARCA_USERNAME || 'MISSING',
    ARCA_PASSWORD: process.env.ARCA_PASSWORD 
      ? `SET (${process.env.ARCA_PASSWORD.length} chars, first="${process.env.ARCA_PASSWORD[0]}", last="${process.env.ARCA_PASSWORD.slice(-1)}")`
      : 'MISSING',
    ARCA_RETURN_URL: process.env.ARCA_RETURN_URL || 'MISSING',
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

    // === TEST MODE: Bypass Arca and return mock response ===
    const isTestMode = body.testMode === true || request.headers.get('x-test-mode') === 'true';
    console.log('[v0] Test mode:', isTestMode);

    if (isTestMode) {
      console.log('[v0] ===== TEST MODE - BYPASSING ARCA =====');
      const mockOrderId = `test-${Date.now()}`;
      const mockFormUrl = `${process.env.ARCA_RETURN_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jojolabs.am'}?orderId=${mockOrderId}&testMode=true`;

      // Update order in database with mock data
      const supabase = await getSupabaseServerClient();
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          arca_order_id: mockOrderId,
          payment_status: 'pending',
          arca_payment_status: 0
        })
        .eq('order_number', orderNumber);

      if (updateError) {
        console.error('[v0] TEST MODE - DB update error:', updateError);
      } else {
        console.log('[v0] TEST MODE - DB updated successfully for order:', orderNumber);
      }

      console.log('[v0] TEST MODE - Returning mock response:', { mockOrderId, mockFormUrl });
      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        formUrl: mockFormUrl,
        testMode: true,
      });
    }

    // === PRODUCTION MODE: Call Arca API ===
    // URL construction debugging
    const rawArcaUrl = process.env.ARCA_API_URL || '';
    const hasTrailingSlash = rawArcaUrl.endsWith('/');
    const hasDoubleSlash = rawArcaUrl.includes('//') && rawArcaUrl.indexOf('//') !== rawArcaUrl.indexOf('://');
    // Normalize: ensure exactly one trailing slash before appending endpoint
    const normalizedBaseUrl = rawArcaUrl.replace(/\/+$/, '') + '/';
    const fullUrl = `${normalizedBaseUrl}register.do`;

    console.log('[v0] ===== URL CONSTRUCTION =====');
    console.log('[v0] Raw ARCA_API_URL value:', JSON.stringify(rawArcaUrl));
    console.log('[v0] Raw URL char codes (last 5):', Array.from(rawArcaUrl.slice(-5)).map(c => `${c}=${c.charCodeAt(0)}`));
    console.log('[v0] Has trailing slash:', hasTrailingSlash);
    console.log('[v0] Has unexpected double slash:', hasDoubleSlash);
    console.log('[v0] Normalized base URL:', normalizedBaseUrl);
    console.log('[v0] Final constructed URL:', fullUrl);
    
    // Validate URL format
    try {
      const parsedUrl = new URL(fullUrl);
      console.log('[v0] Parsed URL:', {
        protocol: parsedUrl.protocol,
        host: parsedUrl.host,
        pathname: parsedUrl.pathname,
        full: parsedUrl.toString(),
      });
    } catch (urlError) {
      console.error('[v0] INVALID URL constructed:', fullUrl, urlError);
    }
    console.log('[v0] ===== END URL CONSTRUCTION =====');

    // Build request parameters (trim env vars to remove hidden chars)
    const rawUsername = process.env.ARCA_USERNAME || '';
    const rawPassword = process.env.ARCA_PASSWORD || '';
    const rawReturnUrl = process.env.ARCA_RETURN_URL || '';
    const cleanUsername = rawUsername.trim().replace(/[\r\n\t\0]/g, '');
    const cleanPassword = rawPassword.trim().replace(/[\r\n\t\0]/g, '');
    const cleanReturnUrl = rawReturnUrl.trim().replace(/[\r\n\t\0]/g, '');

    console.log('[v0] Cleaned credentials:', {
      username_raw_len: rawUsername.length,
      username_clean_len: cleanUsername.length,
      username_changed: rawUsername !== cleanUsername,
      password_raw_len: rawPassword.length,
      password_clean_len: cleanPassword.length,
      password_changed: rawPassword !== cleanPassword,
    });

    const requestParams = {
      userName: cleanUsername,
      password: cleanPassword,
      orderNumber: orderNumber,
      amount: amount.toString(),
      currency: '051',
      returnUrl: cleanReturnUrl,
      description: description || `Order ${orderNumber}`,
      language: 'en',
      sessionTimeoutSecs: '1200',
    };

    console.log('[v0] Request parameters (password redacted):', {
      ...requestParams,
      password: `[REDACTED - ${cleanPassword.length} chars]`,
    });

    const urlSearchParams = new URLSearchParams(requestParams);

    console.log('[v0] Sending POST to Arca:', fullUrl);

    // Register payment with Arca
    const arcaResponse = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlSearchParams,
    });

    console.log('[v0] Arca Response Status:', arcaResponse.status, arcaResponse.statusText);

    const rawResponseText = await arcaResponse.text();
    console.log('[v0] Arca Raw Response:', rawResponseText);

    let arcaData;
    try {
      arcaData = JSON.parse(rawResponseText);
    } catch {
      console.error('[v0] Failed to parse Arca response:', rawResponseText);
      return NextResponse.json(
        { error: 'Invalid response from payment gateway', rawResponse: rawResponseText },
        { status: 502 }
      );
    }

    console.log('[v0] Arca Parsed Response:', JSON.stringify(arcaData, null, 2));

    if (arcaData.errorCode && arcaData.errorCode !== '0' && arcaData.errorCode !== 0) {
      console.error('[v0] ARCA ERROR:', arcaData);
      return NextResponse.json(
        { error: arcaData.errorMessage || 'Payment registration failed', errorCode: arcaData.errorCode },
        { status: 400 }
      );
    }

    console.log('[v0] ARCA SUCCESS:', { orderId: arcaData.orderId, formUrl: arcaData.formUrl });

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
