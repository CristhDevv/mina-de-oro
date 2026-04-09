import OrderHistory from '@/components/account/OrderHistory'

export default function PedidosPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Mis pedidos</h1>
      <OrderHistory />
    </div>
  )
}
