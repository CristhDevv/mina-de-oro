import OrderConfirmation from '@/components/marketplace/OrderConfirmation'
import OrderDetail from '@/components/account/OrderDetail'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function PedidoPage({ params, searchParams }: Props) {
  const { id } = await params
  const { confirmed } = await searchParams
  
  if (confirmed === 'true') {
    return <OrderConfirmation orderId={id} />
  }

  return <OrderDetail orderId={id} />
}
