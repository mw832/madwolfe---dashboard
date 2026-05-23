import { NextRequest, NextResponse } from 'next/server'

const PROMPTS: Record<string, string> = {
  home: 'Give me 6 important film industry news stories or trends from May 2026. Cover indie financing, streaming, festivals, distribution, social media trends for filmmakers, grants. Rank by importance. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Industry","importance":"high"}]',
  industry: 'Give me 5 important independent film industry news stories or trends from May 2026. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Industry"}]',
  streaming: 'Give me 5 important streaming platform news stories from May 2026 relevant to indie filmmakers. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Streaming"}]',
  distribution: 'Give me 5 important indie film distribution news stories from May 2026. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Distribution"}]',
  social: 'Give me 5 important social media trends from May 2026 for indie filmmakers on TikTok Instagram YouTube. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Social"}]',
  gear: 'Give me 5 important film gear and stock news from May 2026. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Gear"}]',
  festivals: 'Give me 5 important film festival news from May 2026. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Festival"}]',
  funding: 'Give me 5 important film grants and funding opportunities from May 2026. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Funding"}]',
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
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1500,
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
