import { NextResponse } from 'next/server';

function inspectValue(label: string, value: string | undefined) {
  if (value === undefined) return { status: 'UNDEFINED', type: 'undefined', raw: null };
  if (value === null) return { status: 'NULL', type: 'null', raw: null };
  if (value === '') return { status: 'EMPTY_STRING', type: 'string', length: 0 };

  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  const charCodes = Array.from(value).map(c => c.charCodeAt(0));

  // Detect special characters that might need URL-encoding
  const specialChars = Array.from(value).filter(c => /[^a-zA-Z0-9]/.test(c));
  const urlEncodingNeeded = Array.from(value).filter(c => /[^a-zA-Z0-9\-_.~]/.test(c));

  // Detect hidden/invisible characters
  const hasLeadingWhitespace = value !== value.trimStart();
  const hasTrailingWhitespace = value !== value.trimEnd();
  const hasNewline = /[\r\n]/.test(value);
  const hasTab = /\t/.test(value);
  const hasNullByte = /\0/.test(value);
  const hasNonPrintable = charCodes.some(c => c < 32 || c === 127);
  const hasNonASCII = charCodes.some(c => c > 127);
  const hasBOM = value.charCodeAt(0) === 0xFEFF;

  return {
    status: 'SET',
    type: typeof value,
    string_length: value.length,
    byte_length: bytes.length,
    bytes_match_chars: value.length === bytes.length,
    first_char: JSON.stringify(value[0]),
    last_char: JSON.stringify(value[value.length - 1]),
    first_3_bytes: Array.from(bytes.slice(0, 3)),
    last_3_bytes: Array.from(bytes.slice(-3)),
    first_5_char_codes: charCodes.slice(0, 5),
    last_5_char_codes: charCodes.slice(-5),
    all_char_codes: label.includes('PASSWORD') ? '[REDACTED]' : charCodes,
    special_characters: {
      found: specialChars,
      count: specialChars.length,
      chars_needing_url_encoding: urlEncodingNeeded,
      url_encoding_count: urlEncodingNeeded.length,
    },
    hidden_characters: {
      has_leading_whitespace: hasLeadingWhitespace,
      has_trailing_whitespace: hasTrailingWhitespace,
      has_newline: hasNewline,
      has_tab: hasTab,
      has_null_byte: hasNullByte,
      has_non_printable: hasNonPrintable,
      has_non_ascii: hasNonASCII,
      has_BOM: hasBOM,
      any_issues: hasLeadingWhitespace || hasTrailingWhitespace || hasNewline || hasTab || hasNullByte || hasNonPrintable || hasNonASCII || hasBOM,
    },
    preview: label.includes('PASSWORD')
      ? `[REDACTED: ${value.length} chars, first="${value[0]}", last="${value.slice(-1)}"]`
      : value,
    trimmed_preview: label.includes('PASSWORD')
      ? `[REDACTED: ${value.trim().length} chars after trim]`
      : value.trim(),
    url_encoded: label.includes('PASSWORD')
      ? `[REDACTED: ${encodeURIComponent(value).length} chars when encoded]`
      : encodeURIComponent(value),
  };
}

export async function GET() {
  const result = {
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV,
    vercel_region: process.env.VERCEL_REGION,

    // Detailed inspection of each ARCA env var
    ARCA_API_URL: inspectValue('ARCA_API_URL', process.env.ARCA_API_URL),
    ARCA_USERNAME: inspectValue('ARCA_USERNAME', process.env.ARCA_USERNAME),
    ARCA_PASSWORD: inspectValue('ARCA_PASSWORD', process.env.ARCA_PASSWORD),
    ARCA_RETURN_URL: inspectValue('ARCA_RETURN_URL', process.env.ARCA_RETURN_URL),

    // URL construction test
    url_construction: (() => {
      const rawUrl = process.env.ARCA_API_URL || '';
      const normalized = rawUrl.replace(/\/+$/, '') + '/';
      const final = `${normalized}register.do`;
      return {
        raw: rawUrl,
        normalized: normalized,
        final_register_url: final,
        has_double_slash: /[^:]\/\//.test(final),
        matches_production: final === 'https://ipay.arca.am/payment/rest/register.do',
        matches_test: final === 'https://ipaytest.arca.am:8445/payment/rest/register.do',
      };
    })(),

    // Simulated URL-encoding of credentials
    url_encoding_test: (() => {
      const username = process.env.ARCA_USERNAME || '';
      const password = process.env.ARCA_PASSWORD || '';
      const params = new URLSearchParams({ userName: username, password: password });
      const encoded = params.toString();
      return {
        username_raw_length: username.length,
        username_encoded: encodeURIComponent(username),
        username_changed_after_encoding: username !== encodeURIComponent(username),
        password_raw_length: password.length,
        password_encoded_length: encodeURIComponent(password).length,
        password_changed_after_encoding: password !== encodeURIComponent(password),
        full_params_encoded_length: encoded.length,
        params_sample: encoded.replace(/password=[^&]+/, 'password=[REDACTED]'),
      };
    })(),

    // Null/undefined check for all ARCA vars
    null_undefined_check: {
      ARCA_API_URL_is_undefined: process.env.ARCA_API_URL === undefined,
      ARCA_API_URL_is_null: process.env.ARCA_API_URL === null,
      ARCA_API_URL_is_empty: process.env.ARCA_API_URL === '',
      ARCA_USERNAME_is_undefined: process.env.ARCA_USERNAME === undefined,
      ARCA_USERNAME_is_null: process.env.ARCA_USERNAME === null,
      ARCA_USERNAME_is_empty: process.env.ARCA_USERNAME === '',
      ARCA_PASSWORD_is_undefined: process.env.ARCA_PASSWORD === undefined,
      ARCA_PASSWORD_is_null: process.env.ARCA_PASSWORD === null,
      ARCA_PASSWORD_is_empty: process.env.ARCA_PASSWORD === '',
      ARCA_RETURN_URL_is_undefined: process.env.ARCA_RETURN_URL === undefined,
      ARCA_RETURN_URL_is_null: process.env.ARCA_RETURN_URL === null,
      ARCA_RETURN_URL_is_empty: process.env.ARCA_RETURN_URL === '',
    },
  };

  console.log('[v0] Diagnostic endpoint called:', JSON.stringify(result, null, 2));

  return NextResponse.json(result);
}
