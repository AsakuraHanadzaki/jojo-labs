import { HeaderWithSearch } from "@/components/header-with-search"
import { Footer } from "@/components/footer"
import { IpayReturnClient } from "./ipay-return-client"
import { getIpayOrderId } from "@/lib/ipay-order-store"

interface IpayReturnPageProps {
  searchParams: { orderNumber?: string }
}

export default function IpayReturnPage({ searchParams }: IpayReturnPageProps) {
  const orderNumber = searchParams.orderNumber
  const orderId = orderNumber ? getIpayOrderId(orderNumber) : undefined

  return (
    <div className="min-h-screen bg-white">
      <HeaderWithSearch />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment return</h1>
            <p className="text-gray-600">
              We verify the payment directly with iPay. The redirect alone is not a confirmation of payment.
            </p>
            <p className="text-sm text-amber-700 mt-2">
              Note: the current order lookup uses in-memory storage, which is not reliable on serverless platforms. Store
              the order mapping in your database for production use.
            </p>
          </div>

          <IpayReturnClient orderNumber={orderNumber} orderId={orderId} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
