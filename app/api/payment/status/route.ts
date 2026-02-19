import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: 'orderId or orderNumber required' },
        { status: 400 }
      );
    }

    const params: Record<string, string> = {
      userName: process.env.ARCA_USERNAME!,
      password: process.env.ARCA_PASSWORD!,
      language: 'en',
    };

    if (orderId) params.orderId = orderId;
    if (orderNumber) params.orderNumber = orderNumber;

    const statusResponse = await fetch(
      `${process.env.ARCA_API_URL}getOrderStatusExtended.do`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params),
      }
    );

    const statusData = await statusResponse.json();

    if (statusData.errorCode && statusData.errorCode !== '0' && statusData.errorCode !== 0) {
      return NextResponse.json(
        { error: statusData.errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber: statusData.orderNumber,
      orderStatus: statusData.orderStatus,
      actionCode: statusData.actionCode,
      actionCodeDescription: statusData.actionCodeDescription,
      amount: statusData.amount,
      currency: statusData.currency,
      cardAuthInfo: statusData.cardAuthInfo,
      date: statusData.date,
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
