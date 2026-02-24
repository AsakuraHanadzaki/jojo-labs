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

    // === VALIDATE AGAINST ARCA API SPEC ===
    // Per official iPay Merchant Manual (Armenian Card CJSC):
    //   URL: https://ipay.arca.am/payment/rest/register.do (production)
    //   URL: https://ipaytest.arca.am:8445/payment/rest/register.do (test)
    //   Required params: userName (AN..30), password (AN..30), orderNumber (AN..32), amount (N..20), returnUrl (AN..512)
    //   Optional params: currency (N3), description (AN..1024), language (A2), pageView (A..7), sessionTimeoutSecs (N..9)
    //   Content-Type: application/x-www-form-urlencoded
    //   Error code 5 meanings: "Unknown merchant name" / "Access denied" / "User disabled"
    
    console.log('[v0] ===== ARCA SPEC VALIDATION =====');
    
    // Validate URL matches known Arca endpoints
    const knownProdUrl = 'https://ipay.arca.am/payment/rest/register.do';
    const knownTestUrl = 'https://ipaytest.arca.am:8445/payment/rest/register.do';
    const urlMatchesProd = fullUrl === knownProdUrl;
    const urlMatchesTest = fullUrl === knownTestUrl;
    console.log('[v0] URL matches production endpoint:', urlMatchesProd, `(expected: ${knownProdUrl})`);
    console.log('[v0] URL matches test endpoint:', urlMatchesTest, `(expected: ${knownTestUrl})`);
    if (!urlMatchesProd && !urlMatchesTest) {
      console.warn('[v0] WARNING: URL does not match any known Arca endpoint!');
      console.warn('[v0] Actual URL:', fullUrl);
    }
    
    // Validate parameter constraints per spec
    console.log('[v0] Param validation:', {
      userName_length: cleanUsername.length, userName_maxLength: 30, userName_ok: cleanUsername.length > 0 && cleanUsername.length <= 30,
      password_length: cleanPassword.length, password_maxLength: 30, password_ok: cleanPassword.length > 0 && cleanPassword.length <= 30,
      orderNumber_length: orderNumber.length, orderNumber_maxLength: 32, orderNumber_ok: orderNumber.length > 0 && orderNumber.length <= 32,
      amount_value: amount.toString(), amount_isNumeric: /^\d+$/.test(amount.toString()), amount_note: 'Must be in minor currency units (luma for AMD)',
      currency_value: '051', currency_note: 'AMD = 051 per ISO 4217',
      returnUrl_length: cleanReturnUrl.length, returnUrl_maxLength: 512, returnUrl_ok: cleanReturnUrl.length > 0 && cleanReturnUrl.length <= 512,
    });
    console.log('[v0] ===== END SPEC VALIDATION =====');

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

    // Build URL-encoded body and verify format
    const urlSearchParams = new URLSearchParams(requestParams);
    const encodedBody = urlSearchParams.toString();
    console.log('[v0] Content-Type: application/x-www-form-urlencoded');
    console.log('[v0] Encoded body (password redacted):', encodedBody.replace(/password=[^&]+/, 'password=[REDACTED]'));
    console.log('[v0] Body is properly URL-encoded:', encodedBody.includes('userName=') && encodedBody.includes('&orderNumber='));

    console.log('[v0] Sending POST to Arca:', fullUrl);

    // Track request timing
    const requestStartTime = Date.now();

    // Register payment with Arca
    const arcaResponse = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlSearchParams,
    });

    const requestDuration = Date.now() - requestStartTime;

    // === LOG ABSOLUTELY EVERYTHING FROM ARCA RESPONSE ===
    console.log('[v0] ===== ARCA FULL RESPONSE DUMP =====');
    console.log('[v0] Response timing:', requestDuration, 'ms');
    console.log('[v0] HTTP status code:', arcaResponse.status);
    console.log('[v0] HTTP status text:', arcaResponse.statusText);
    console.log('[v0] Response OK:', arcaResponse.ok);
    console.log('[v0] Response type:', arcaResponse.type);
    console.log('[v0] Response URL (after redirects):', arcaResponse.url);
    console.log('[v0] Was redirected:', arcaResponse.redirected);

    // Log ALL response headers
    console.log('[v0] === ALL RESPONSE HEADERS ===');
    const allHeaders: Record<string, string> = {};
    arcaResponse.headers.forEach((value, key) => {
      allHeaders[key] = value;
      console.log(`[v0]   ${key}: ${value}`);
    });
    console.log('[v0] Headers as JSON:', JSON.stringify(allHeaders, null, 2));

    // Get raw response body
    const rawResponseText = await arcaResponse.text();
    console.log('[v0] === RAW RESPONSE BODY ===');
    console.log('[v0] Body length:', rawResponseText.length, 'chars');
    console.log('[v0] Body byte length:', new TextEncoder().encode(rawResponseText).length, 'bytes');
    console.log('[v0] Body content:', rawResponseText);
    console.log('[v0] Body first 500 chars:', rawResponseText.slice(0, 500));
    console.log('[v0] Body char codes (first 50):', Array.from(rawResponseText.slice(0, 50)).map(c => c.charCodeAt(0)));

    // Check if response is HTML (error page) instead of JSON
    const isHtml = rawResponseText.trim().startsWith('<') || rawResponseText.includes('<!DOCTYPE') || rawResponseText.includes('<html');
    const isJson = rawResponseText.trim().startsWith('{') || rawResponseText.trim().startsWith('[');
    console.log('[v0] Response appears to be HTML:', isHtml);
    console.log('[v0] Response appears to be JSON:', isJson);

    if (isHtml) {
      console.error('[v0] ARCA RETURNED HTML INSTEAD OF JSON - likely an error page or wrong URL');
      console.error('[v0] HTML content:', rawResponseText.slice(0, 1000));
      return NextResponse.json(
        { error: 'Payment gateway returned HTML instead of JSON - check API URL', htmlSnippet: rawResponseText.slice(0, 500) },
        { status: 502 }
      );
    }

    let arcaData;
    try {
      arcaData = JSON.parse(rawResponseText);
    } catch (parseErr) {
      console.error('[v0] Failed to parse Arca response as JSON');
      console.error('[v0] Parse error:', (parseErr as Error).message);
      console.error('[v0] Raw response was:', rawResponseText);
      return NextResponse.json(
        { error: 'Invalid response from payment gateway', rawResponse: rawResponseText },
        { status: 502 }
      );
    }

    console.log('[v0] Parsed JSON response:', JSON.stringify(arcaData, null, 2));
    console.log('[v0] All response keys:', Object.keys(arcaData));
    console.log('[v0] All response values:', Object.entries(arcaData).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', '));
    console.log('[v0] ===== END ARCA FULL RESPONSE DUMP =====');

    if (arcaData.errorCode && arcaData.errorCode !== '0' && arcaData.errorCode !== 0) {
      console.error('[v0] ===== ARCA ERROR DETAILS =====');
      console.error('[v0] Error code:', arcaData.errorCode, '(type:', typeof arcaData.errorCode, ')');
      console.error('[v0] Error message:', arcaData.errorMessage);
      console.error('[v0] Order ID (if any):', arcaData.orderId);
      console.error('[v0] All error fields:', JSON.stringify(arcaData, null, 2));
      console.error('[v0] Error code meaning per Arca spec:');
      const errorMeanings: Record<string, string> = {
        '1': 'Order number already registered',
        '3': 'Unknown currency',
        '4': 'Missing required parameter',
        '5': 'Access denied / Unknown merchant / User disabled',
        '6': 'Unrecognized payment type',
        '7': 'Invalid amount',
        '14': 'Duplicate orderNumber',
      };
      console.error('[v0]   Code', arcaData.errorCode, '=', errorMeanings[String(arcaData.errorCode)] || 'Unknown error code');
      console.error('[v0] Response timing was:', requestDuration, 'ms');
      console.error('[v0] Request URL was:', fullUrl);
      console.error('[v0] ===== END ARCA ERROR DETAILS =====');
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
