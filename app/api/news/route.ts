import { NextRequest, NextResponse } from 'next/server'

const PROMPTS: Record<string, string> = {
  home: 'Give me 6 important film industry news stories or trends from May 2026. Cover indie financing, streaming, festivals, distribution, social media trends for filmmakers, grants. Rank by importance. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Industry","importance":"high","source":"Publication or website name"}]',
  industry: 'Give me 5 important independent film industry news stories or trends from May 2026. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Industry","source":"Publication or website name"}]',
  streaming: 'Give me 5 important streaming platform news stories from May 2026 relevant to indie filmmakers. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Streaming","source":"Publication or website name"}]',
  distribution: 'Give me 5 important indie film distribution news stories from May 2026. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Distribution","source":"Publication or website name"}]',
  social: 'Give me 5 important social media trends from May 2026 for indie filmmakers on TikTok Instagram YouTube. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Social","source":"Platform or publication name"}]',
  gear: 'Give me 5 important film gear and stock news from May 2026. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Gear","source":"Publication or website name"}]',
  festivals: 'Give me 5 important film festival news from May 2026. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Festival","source":"Publication or website name"}]',
  funding: 'Give me 5 important film grants and funding opportunities from May 2026. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Funding","source":"Publication or website name"}]',
  boxoffice: 'Give me 5 important box office stories from May 2026. What films are performing well, what is trending theatrically, what indie films are breaking out. Return ONLY a JSON array no markdown no preamble: [{"headline":"...","summary":"2 sentences","category":"Box Office","source":"Publication or website name"}]',
}

export const runtime = 'nodejs'
export const maxDuration = 30

async function callClaude(prompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(data))
  const text = data.content.map((b: any) => b.text || '').join('')
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'home'
  const prompt = PROMPTS[category] || PROMPTS['home']

  try {
    const news = await callClaude(prompt)
    return NextResponse.json({ news })
  } catch (err) {
    console.error('News API error:', err)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    const news = await callClaude(prompt)
    return NextResponse.json({ news })
  } catch (err) {
    console.error('Recs API error:', err)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
