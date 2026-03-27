/**
 * E-HDM (Electronic Cash Register) Service for Armenian Tax Fiscalization
 * PayX LLC API Integration
 * 
 * This service handles:
 * - Method 1: Login/Authentication
 * - Method 2: Print (Register sales with tax authority)
 * - Method 5: Reverse (Process returns/refunds)
 */

const EHDM_API_BASE = 'https://store.payx.am/api';

interface EHDMProduct {
  adgCode: string;        // Product HS code / PCTAC classification
  goodCode: string;       // Product barcode / internal code
  goodName: string;       // Product name (max 50 chars)
  quantity: number;       // Quantity (max 3 decimal places)
  unit: string;           // Unit of measurement
  price: number;          // Selling price (max 2 decimal places)
  discount?: number;      // Discount amount
  discountType?: 1 | 2;   // 1 = percentage, 2 = AMD
  receiptProductId: number; // Product index (starts from 0)
  dep: 1 | 2 | 3 | 7;     // 1=VAT, 2=VAT exempt, 3=Turnover tax, 7=microenterprise
}

interface EHDMPrintRequest {
  products: EHDMProduct[];
  additionalDiscount?: number;
  additionalDiscountType?: 8 | 16;  // 8=percentage, 16=fixed
  cashAmount: number;
  cardAmount: number;
  partialAmount?: number;
  prePaymentAmount?: number;
  partnerTin?: string;
  uniqueCode: string;     // Unique request ID (max 30 chars, alphanumeric)
  eMarks?: string[];
}

interface EHDMPrintResponse {
  link: string;           // PDF receipt URL
  reverceLink?: string;   // Reverse receipt URL
  res: {
    printResponse: {
      rseq: number;
      crn: string;
      sn: string;
      tin: string;
      taxpayer: string;
      address: string;
      time: number;
      total: number;
      change: number;
      qr: string;
      commercial_address: string;
      commercial_name: string;
    };
    printResponseInfo: {
      cashierId: number;
      cardAmount: number;
      cashAmount: number;
      partialAmount: number;
      prePayment: number;
      saleType: number;
      receiptType: number;
      receiptSubType: number;
      totalAmount: number;
      time: number;
      items: Array<{
        receiptProductId: number;
        quantity: number;
        dep: number;
        vat: number;
        taxRegime: number;
        goodCode: string;
        goodName: string;
        adgCode: string;
        unit: string;
        price: number;
        totalWithoutTaxes: number;
        totalWithTaxes: number;
      }>;
    };
    recieptId: number;
    receiptId: number;
    message: string;
  };
}

interface EHDMReverseRequest {
  historyId: number;
  products?: Array<{
    receiptProductId: number;
    quantity: number;
  }>;
  cashAmount: number;
  cardAmount: number;
  prePaymentAmount?: number;
  emarks?: string[];
}

class EHDMService {
  private jwtToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Method 1: Login to E-HDM system and get JWT token
   */
  async login(): Promise<boolean> {
    const username = process.env.EHDM_USERNAME;
    const password = process.env.EHDM_PASSWORD;

    if (!username || !password) {
      console.error('[E-HDM] Missing EHDM_USERNAME or EHDM_PASSWORD environment variables');
      return false;
    }

    try {
      console.log('[E-HDM] Attempting login...');
      
      const response = await fetch(`${EHDM_API_BASE}/Login/LoginUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        console.error('[E-HDM] Login failed with status:', response.status);
        return false;
      }

      // JWT token is returned in response headers as 'Authorization'
      const authHeader = response.headers.get('Authorization') || 
                         response.headers.get('authorization') ||
                         response.headers.get('token');
      
      if (authHeader) {
        this.jwtToken = authHeader.replace('Bearer ', '');
        // Set token expiry to 55 minutes (tokens typically last 1 hour)
        this.tokenExpiry = Date.now() + 55 * 60 * 1000;
        console.log('[E-HDM] Login successful, token acquired');
        return true;
      }

      // Some APIs return token in body
      const data = await response.json();
      if (data.token) {
        this.jwtToken = data.token;
        this.tokenExpiry = Date.now() + 55 * 60 * 1000;
        console.log('[E-HDM] Login successful, token acquired from body');
        return true;
      }

      console.log('[E-HDM] Login response:', data);
      return data.message === 'Login successfully';
    } catch (error) {
      console.error('[E-HDM] Login error:', error);
      return false;
    }
  }

  /**
   * Ensure we have a valid token
   */
  private async ensureAuthenticated(): Promise<boolean> {
    if (this.jwtToken && Date.now() < this.tokenExpiry) {
      return true;
    }
    return this.login();
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.jwtToken ? { 'Authorization': `Bearer ${this.jwtToken}` } : {}),
    };
  }

  /**
   * Method 2: Print - Register a sale with tax authority
   */
  async printReceipt(request: EHDMPrintRequest): Promise<EHDMPrintResponse | null> {
    const isAuthenticated = await this.ensureAuthenticated();
    if (!isAuthenticated) {
      console.error('[E-HDM] Failed to authenticate before print');
      return null;
    }

    try {
      console.log('[E-HDM] Registering sale with tax authority...');
      console.log('[E-HDM] Request:', JSON.stringify(request, null, 2));

      const response = await fetch(`${EHDM_API_BASE}/Hdm/Print`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      // Update token from response headers if provided
      const newToken = response.headers.get('Authorization');
      if (newToken) {
        this.jwtToken = newToken.replace('Bearer ', '');
        this.tokenExpiry = Date.now() + 55 * 60 * 1000;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[E-HDM] Print failed:', response.status, errorText);
        return null;
      }

      const data: EHDMPrintResponse = await response.json();
      console.log('[E-HDM] Print successful:', {
        receiptId: data.res?.receiptId,
        link: data.link,
        total: data.res?.printResponse?.total,
      });

      return data;
    } catch (error) {
      console.error('[E-HDM] Print error:', error);
      return null;
    }
  }

  /**
   * Method 5: Reverse - Process a return/refund
   */
  async reverseReceipt(request: EHDMReverseRequest): Promise<EHDMPrintResponse | null> {
    const isAuthenticated = await this.ensureAuthenticated();
    if (!isAuthenticated) {
      console.error('[E-HDM] Failed to authenticate before reverse');
      return null;
    }

    try {
      console.log('[E-HDM] Processing return/refund...');
      console.log('[E-HDM] Reverse request:', JSON.stringify(request, null, 2));

      const response = await fetch(`${EHDM_API_BASE}/Hdm/Reverse`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      // Update token from response headers if provided
      const newToken = response.headers.get('Authorization');
      if (newToken) {
        this.jwtToken = newToken.replace('Bearer ', '');
        this.tokenExpiry = Date.now() + 55 * 60 * 1000;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[E-HDM] Reverse failed:', response.status, errorText);
        return null;
      }

      const data: EHDMPrintResponse = await response.json();
      console.log('[E-HDM] Reverse successful:', {
        receiptId: data.res?.receiptId,
        link: data.link,
        reverceLink: data.reverceLink,
      });

      return data;
    } catch (error) {
      console.error('[E-HDM] Reverse error:', error);
      return null;
    }
  }

  /**
   * Generate unique code for E-HDM (max 30 chars, alphanumeric)
   */
  static generateUniqueCode(orderId: string): string {
    const timestamp = Date.now().toString(36);
    const cleanOrderId = orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
    return `${cleanOrderId}${timestamp}`.slice(0, 30);
  }

  /**
   * Convert order items to E-HDM product format
   */
  static convertOrderItemsToEHDMProducts(
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>,
    vatType: 1 | 2 | 3 | 7 = 1  // Default to VAT taxable
  ): EHDMProduct[] {
    return items.map((item, index) => ({
      adgCode: '3304',  // HS code for cosmetics/skincare
      goodCode: item.product_id,
      goodName: item.product_name.slice(0, 50),  // Max 50 chars
      quantity: item.quantity,
      unit: 'հատ',  // "piece" in Armenian
      price: item.unit_price,
      receiptProductId: index,
      dep: vatType,
    }));
  }
}

// Export singleton instance
export const ehdmService = new EHDMService();
export { EHDMService, type EHDMProduct, type EHDMPrintRequest, type EHDMPrintResponse, type EHDMReverseRequest };
