import { NextResponse } from 'next/server';

const DJANGO_BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.DJANGO_API_URL ||
  'http://localhost:8000/api'
).replace(/\/+$/, '');

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '12';
  const refresh = searchParams.get('refresh') || 'false';

  try {
    const backendUrl = `${DJANGO_BACKEND_URL}/instagram/feed/?limit=${limit}&refresh=${refresh}`;
    const res = await fetch(backendUrl, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (backendErr) {
    // If backend is not reached, try direct Meta API or fallback
  }

  // Fallback direct Meta Graph API if INSTAGRAM_ACCESS_TOKEN is configured in Next.js env
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (accessToken) {
    try {
      const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username';
      const metaUrl = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${accessToken}&limit=${limit}`;
      const metaRes = await fetch(metaUrl, { cache: 'no-store' });
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        const items = (metaData.data || []).map((item) => ({
          id: item.id,
          caption: item.caption || '',
          media_type: (item.media_type || 'IMAGE').toUpperCase(),
          media_url: item.media_url || item.thumbnail_url || '',
          thumbnail_url: item.thumbnail_url || item.media_url || '',
          permalink: item.permalink || 'https://www.instagram.com/suratchagaurinandan',
          timestamp: item.timestamp || '',
          username: item.username || 'suratchagaurinandan',
          is_reel: item.media_type === 'VIDEO' || item.permalink?.includes('/reel/'),
          formatted_date: item.timestamp ? item.timestamp.slice(0, 10) : 'Live',
        }));

        return NextResponse.json({
          success: true,
          status: 'live',
          configured: true,
          source: 'nextjs_meta_graph_api',
          count: items.length,
          data: items,
        });
      }
    } catch (metaErr) {
      console.error('[Next.js Instagram Route] Meta API error:', metaErr);
    }
  }

  // Final fallback response
  return NextResponse.json({
    success: true,
    status: 'unconfigured',
    configured: false,
    source: 'fallback',
    message: 'Configure INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_APP_SECRET in backend/.env',
    data: [
      {
        id: 'post_1',
        caption: '🚩 Divine Mangala Aarti Darshan of Surat Cha Gaurinandan! #GaneshMahotsav2026 #Surat',
        media_type: 'VIDEO',
        media_url: 'https://images.unsplash.com/photo-1567591974584-f1832d43232f?auto=format&fit=crop&w=800&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1567591974584-f1832d43232f?auto=format&fit=crop&w=800&q=80',
        permalink: 'https://www.instagram.com/suratchagaurinandan',
        timestamp: '2026-08-27T03:30:00Z',
        username: 'suratchagaurinandan',
        is_reel: true,
        formatted_date: '27 Aug 2026',
      },
      {
        id: 'post_2',
        caption: '✨ Swarna Shringaar Darshan of Bappa at the Grand Sanctum. #SuratChaGaurinandan #Darshan',
        media_type: 'IMAGE',
        media_url: 'https://images.unsplash.com/photo-1609358905581-e5382c473188?auto=format&fit=crop&w=800&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1609358905581-e5382c473188?auto=format&fit=crop&w=800&q=80',
        permalink: 'https://www.instagram.com/suratchagaurinandan',
        timestamp: '2026-08-26T14:30:00Z',
        username: 'suratchagaurinandan',
        is_reel: false,
        formatted_date: '26 Aug 2026',
      },
      {
        id: 'post_3',
        caption: '🥁 Dhol Tasha Pathak beats echoing through Surat! #Aagman2026 #BappaMoraya',
        media_type: 'VIDEO',
        media_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
        permalink: 'https://www.instagram.com/suratchagaurinandan',
        timestamp: '2026-08-25T11:00:00Z',
        username: 'suratchagaurinandan',
        is_reel: true,
        formatted_date: '25 Aug 2026',
      },
      {
        id: 'post_4',
        caption: '🌸 51,000 Modak Mahaprasad preparation underway. Ganpati Bappa Morya! #Mahaprasad',
        media_type: 'IMAGE',
        media_url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80',
        permalink: 'https://www.instagram.com/suratchagaurinandan',
        timestamp: '2026-08-24T09:15:00Z',
        username: 'suratchagaurinandan',
        is_reel: false,
        formatted_date: '24 Aug 2026',
      },
    ],
  });
}
