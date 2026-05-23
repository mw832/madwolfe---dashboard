import { NextRequest, NextResponse } from 'next/server'

const PROMPTS: Record<string, string> = {
  home: 'Search for the 6 most important film industry news stories from the past week relevant to an indie film company. Cover: financing, streaming deals, festivals, distribution, social trends, grants. Rank by importance. Return ONLY a JSON array no markdown: [{"headline":"...","summary":"2 sentences","category":"Industry|Streaming|Distribution|Festival|Social|Funding|Box Office","importance":"high|medium"}]',
  industry: 'Search for 5 important independent film industry news stories from the past week. Return ONLY a JSON array no markdown: [{"headline":"...","summary":"2 sentences","category":"Industry"}]',
  streaming: 'Search for 5 important streaming platform news stories from the past week for indie filmmakers. Return ONLY a JSON array no markdown: [{"headline":"...","summary":"2 sentences","category":"Streaming"}]',
  distribution: 'Search for 5 important indie film distribution news stories from the past week. Return ONLY a JSON array no markdown: [{"headline":"...","summary":"2 sentences","category":"Distribution"}]',
  social: 'Search for 5 important social media trends from the past week for indie filmmakers. Return ONLY a JSON array no markdown: [{"headline":"...","summary":"2 sentences","category":"Social"}]',
  gear: 'Search for 5 important film gear and stock news stories from the past week. Return ONLY a JSON array no markdown: [{"headline":"...","summary":"2 sentences","category":"Gear"}]',
  festivals: 'Search for 5 important film festival news stories from the past week. Return ONLY a JSON array no markdown: [{"headline":"...","summary":"2 sentences","category":"Festival"}]',
  funding: 'Search for 5 important film grants and funding opportunities from the past week. Return ONLY a JSON array no markdown: [{"headline":"...","summary":"2 sentences","category":"Funding"}]',
}

export const runtime = 'nodejs'
export const maxDuration = 30

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
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status })

    const text = data.content.map((b: any) => b.text || '').join('')
    const clean = text.replace(/```json|```/g, '').trim()
    const news = JSON.parse(clean)
    return NextResponse.json({ news })
  } catch (err) {
    console.error('News API error:', err)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
