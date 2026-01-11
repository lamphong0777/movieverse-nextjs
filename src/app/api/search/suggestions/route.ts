import { NextResponse } from 'next/server';
import axios from 'axios';

const BASE_API = 'https://phimapi.com';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const response = await axios.get(`${BASE_API}/v1/api/tim-kiem`, {
      params: {
        keyword: q,
        page: 1,
        limit: 8,
      },
      timeout: 8000,
    });

    const apiData = response.data;

    if (apiData.status !== 'success' || !apiData.data?.items) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = apiData.data.items
      .map((item: any) => {
        if (!item.slug || !item.name) return null;

        return {
          name: item.name,
          originName: item.origin_name || '',
          slug: item.slug,
          thumbUrl: item.thumb_url || item.poster_url || '', // ✅ thêm ảnh
        };
      })
      .filter(Boolean)
      .slice(0, 10);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestions proxy error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
