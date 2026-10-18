import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();
  if (!query) return NextResponse.json({ error: 'Enter a search term first.' }, { status: 400 });
  if (query.length > 120) return NextResponse.json({ error: 'Search terms must be 120 characters or fewer.' }, { status: 400 });

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: 'Asset search is not configured yet. Add UNSPLASH_ACCESS_KEY to your server environment and redeploy.' },
      { status: 503 }
    );
  }

  try {
    const upstream = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=24&content_filter=high`,
      { headers: { Authorization: `Client-ID ${accessKey}` }, next: { revalidate: 60 } }
    );
    if (!upstream.ok) {
      return NextResponse.json(
        { error: upstream.status === 429 ? 'The asset provider rate limit was reached. Please try again later.' : 'The asset provider could not complete your search.' },
        { status: upstream.status === 429 ? 429 : 502 }
      );
    }
    const data = await upstream.json();
    const results = Array.isArray(data.results) ? data.results.map((image: {
      id: string; alt_description?: string | null; urls: { regular: string; full: string };
      user: { name: string; links?: { html?: string } };
      links?: { download_location?: string };
    }) => ({
      id: image.id,
      alt_description: image.alt_description || 'Unsplash photograph',
      urls: { regular: image.urls.regular, full: image.urls.full },
      user: { name: image.user.name, links: { html: image.user.links?.html } },
      links: { download_location: image.links?.download_location },
    })) : [];
    return NextResponse.json({ results }, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch {
    return NextResponse.json({ error: 'Unable to reach the asset provider. Check your connection and retry.' }, { status: 502 });
  }
}
