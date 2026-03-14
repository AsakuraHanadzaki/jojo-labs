import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ error: 'No product ID provided' }, { status: 400 });
    }

    // Get file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    if (!validExtensions.includes(extension)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, WEBP, or GIF.' }, { status: 400 });
    }

    // Create a clean filename
    const timestamp = Date.now();
    const cleanName = `product-${productId}-${timestamp}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(cleanName, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Update the product in Supabase with the new image URL
    const supabase = await getSupabaseServerClient();
    const { error: updateError } = await supabase
      .from('products')
      .update({ image: blob.url })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating product image:', updateError);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      productId 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
