import { NextRequest, NextResponse } from 'next/server'

const PROMPTS: Record<string, string> = {
  home: `You are a news curator for MadWolfe Productions, an independent film company based in New Orleans. Search for the 6 most important and relevant news stories from the past week across ALL of these areas: independent film financing, streaming platform deals, film festival announcements, indie distribution news, social media trends for filmmakers, film grants and funding, box office trends. Rank them by importance and relevance to a small indie film production company. Return ONLY a JSON array, no markdown, no preamble. Format: [{"headline":"...","summary":"2 sentence summary","category":"one of: Industry | Streaming | Distribution | Festival | Social | Funding | Box Office","importance":"high|medium"}]`,
  industry: `Search for the 5 most important independent film industry news stories from the past week. Focus on: box office, major film deals, production company news, filmmaker announcements, A24, NEON, indie studios. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Industry"}]`,
  streaming: `Search for the 5 most important streaming platform news stories from the past week relevant to indie filmmakers. Focus on: Netflix, A24, Mubi, Amazon, Apple TV+, Hulu acquisitions, cancellations, viewership trends, indie film pickups, what kind of content is getting picked up. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Streaming"}]`,
  distribution: `Search for the 5 most important indie film distribution news stories from the past week. Focus on: sales agent deals, VOD releases, theatrical distribution trends, Visit Films, Shoreline, Indie Rights, day-and-date releases. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Distribution"}]`,
  social: `Search for the 5 most important social media trends from the past week relevant to indie filmmakers and film production companies. Focus on: trending TikTok/Instagram/YouTube sounds, film-related viral content, creators gaining traction, trending formats for film promotion, what film content is performing well. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Social"}]`,
  gear: `Search for the 5 most important film gear and stock news stories from the past week. Focus on: Kodak/Fuji film stock availability and pricing, camera releases, RED, ARRI, Sony FX news, rental trends, cinematography gear. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Gear"}]`,
  festivals: `Search for the 5 most important film festival news stories from the past week. Focus on: Sundance, SXSW, Tribeca, NOFF, submission deadlines, lineup announcements, award winners, festival circuit trends, films that got distribution after festivals. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Festival"}]`,
  funding: `Search for the 5 most important film grants and funding opportunities from the past week. Focus on: open grant calls, new film funds, Sundance Institute, IFP, Louisiana film incentives, tax credits, crowdfunding trends, investor news for indie film. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Funding"}]`,
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'home'
  const prompt = PROMPTS[category] || PROMPTS['home']

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status })
    }

    const text = data.content.map((b: any) => b.text || '').join('')
    const clean = text.replace(/```json|```/g, '').trim()
    const news = JSON.parse(clean)

    return NextResponse.json({ news }, {
      headers: { 'Cache-Control': 's-maxage=21600, stale-while-revalidate' }
    })
  } catch (err) {
    console.error('News API error:', err)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
