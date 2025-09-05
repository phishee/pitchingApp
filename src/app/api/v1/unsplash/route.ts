import { NextRequest, NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY; // No NEXT_PUBLIC_ prefix

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const page = searchParams.get('page') || '1';
  const orientation = searchParams.get('orientation');
  const color = searchParams.get('color');
  const orderBy = searchParams.get('orderBy') || 'relevant';
  const perPage = searchParams.get('perPage') || '20';

  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const params = new URLSearchParams({
      query: query || 'fitness',
      page,
      per_page: perPage,
      order_by: orderBy,
      client_id: UNSPLASH_ACCESS_KEY,
    });

    if (orientation) params.append('orientation', orientation);
    if (color) params.append('color', color);

    const response = await fetch(`https://api.unsplash.com/search/photos?${params}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unsplash API error:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}