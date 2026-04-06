import OrderConfirmation from '@/components/marketplace/OrderConfirmation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PedidoPage({ params }: Props) {
  const { id } = await params
  return <OrderConfirmation orderId={id} />
}
