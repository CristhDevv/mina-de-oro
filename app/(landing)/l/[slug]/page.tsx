import { createClient } from '@/lib/supabase/server';
import ProductDetail from '@/components/marketplace/ProductDetail';
import { notFound } from 'next/navigation';
import { Product } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-white">
      <ProductDetail product={product as Product} />
    </main>
  );
}
