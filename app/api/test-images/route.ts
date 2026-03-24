import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await getSupabaseServerClient();
  
  const { data: products } = await supabase
    .from('products')
    .select('name, image')
    .limit(5);

  // Test if each image URL is accessible
  const results = await Promise.all(
    (products || []).map(async (product) => {
      if (!product.image || product.image === '/placeholder.svg') {
        return { name: product.name, image: product.image, status: 'placeholder' };
      }
      
      try {
        const response = await fetch(product.image, { method: 'HEAD' });
        return {
          name: product.name,
          image: product.image,
          status: response.ok ? 'accessible' : `error-${response.status}`,
          contentType: response.headers.get('content-type'),
        };
      } catch (error) {
        return {
          name: product.name,
          image: product.image,
          status: 'fetch-failed',
          error: (error as Error).message,
        };
      }
    })
  );

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results,
  });
}
