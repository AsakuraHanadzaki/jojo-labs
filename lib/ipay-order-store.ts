const orderStore = new Map<string, string>()

export function saveIpayOrder(orderNumber: string, orderId: string) {
  orderStore.set(orderNumber, orderId)
}

export function getIpayOrderId(orderNumber: string) {
  return orderStore.get(orderNumber)
}

export function hasIpayOrder(orderNumber: string) {
  return orderStore.has(orderNumber)
}
