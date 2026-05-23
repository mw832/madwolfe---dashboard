'use client'
import { useState, useEffect, useCallback } from 'react'

const CATEGORIES = [
  { id: 'industry', label: 'Industry News', color: '#b8b8c8' },
  { id: 'streaming', label: 'Streaming', color: '#8878b0' },
  { id: 'distribution', label: 'Distribution', color: '#6a90b8' },
  { id: 'social', label: 'Social Trends', color: '#b06080' },
  { id: 'gear', label: 'Film Stocks & Gear', color: '#b89060' },
  { id: 'festivals', label: 'Festival Circuit', color: '#6ab87a' },
  { id: 'grants', label: 'Grants & Funding', color: '#c06060' },
]

const PROMPTS: Record<string, string> = {
  industry: 'Search for the 4 most important independent film industry news stories from the past week. Focus on: box office, major film deals, production company news, filmmaker announcements. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Industry News"}]',
  streaming: 'Search for the 4 most important streaming platform news stories from the past week. Focus on: Netflix, A24, Mubi, Amazon, Apple TV+ acquisitions, cancellations, viewership trends, indie film pickups. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Streaming"}]',
  distribution: 'Search for the 4 most important indie film distribution news stories from the past week. Focus on: sales agent deals, VOD releases, theatrical distribution trends, indie distributors. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Distribution"}]',
  social: 'Search for the 4 most important social media trends from the past week relevant to indie filmmakers. Focus on: trending TikTok/Instagram/YouTube sounds, film-related viral content, creators gaining traction, trending formats for film promotion. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Social Trends"}]',
  gear: 'Search for the 4 most important film gear and stock news stories from the past week. Focus on: Kodak/Fuji film stock news, camera releases, rental trends, cinematography gear. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Film Stocks & Gear"}]',
  festivals: 'Search for the 4 most important film festival news stories from the past week. Focus on: submission deadlines, lineup announcements, award winners, festival circuit trends. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Festival Circuit"}]',
  grants: 'Search for the 4 most important film grants and funding opportunities from the past week. Focus on: open calls, new funds, deadline reminders, indie filmmaker funding news. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Grants & Funding"}]',
}

const REFRESH_INTERVAL = 6 * 60 * 60 * 1000

export default function News() {
  const [activeCategory, setActiveCategory] = useState('industry')
  const [news, setNews] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [lastFetched, setLastFetched] = useState<Record<string, number>>({})

  const fetchCategory = useCallback(async (categoryId: string) => {
    setLoading(prev => ({ ...prev, [categoryId]: true }))
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: PROMPTS[categoryId] }]
        })
      })
      const data = await res.json()
      const text = data.content.map((b: any) => b.text || '').join('')
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      setNews(prev => ({ ...prev, [categoryId]: parsed }))
      setLastFetched(prev => ({ ...prev, [categoryId]: Date.now() }))
    } catch {
      setNews(prev => ({ ...prev, [categoryId]: [{ headline: 'Could not load news', summary: 'Check your connection and try again.', category: 'Error' }] }))
    }
    setLoading(prev => ({ ...prev, [categoryId]: false }))
  }, [])

  useEffect(() => {
    const now = Date.now()
    const last = lastFetched[activeCategory]
    if (!last || now - last > REFRESH_INTERVAL) {
      fetchCategory(activeCategory)
    }
  }, [activeCategory, fetchCategory, lastFetched])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCategory(activeCategory)
    }, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [activeCategory, fetchCategory])

  const currentNews = news[activeCategory] || []
  const isLoading = loading[activeCategory]
  const cat = CATEGORIES.find(c => c.id === activeCategory)!
  const last = lastFetched[activeCategory]

  function formatLastFetched(ts: number) {
    const diff = Math.floor((Date.now() - ts) / 60000)
    if (diff < 1) return 'just now'
    if (diff < 60) return `${diff}m ago`
    return `${Math.floor(diff / 60)}h ago`
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Industry Feed</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            {last ? `Updated ${formatLastFetched(last)} · auto-refreshes every 6h` : 'Loading...'}
          </div>
        </div>
        <button onClick={() => fetchCategory(activeCategory)} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.35)', padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>
          ↻ Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{
            background: activeCategory === c.id ? `${c.color}18` : 'rgba(255,255,255,0.03)',
            border: `0.5px solid ${activeCategory === c.id ? c.color : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 20, color: activeCategory === c.id ? c.color : 'rgba(255,255,255,0.4)',
            padding: '5px 14px', cursor: 'pointer', fontSize: 12, fontWeight: activeCategory === c.id ? 500 : 400,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            {c.label}
            {loading[c.id] && <span style={{ fontSize: 10, opacity: 0.6 }}>●</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 18px', height: 80 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {currentNews.map((n, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderLeft: `2px solid ${cat.color}`, borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.88)', lineHeight: 1.4 }}>{n.headline}</div>
                <span style={{ fontSize: 10, fontWeight: 500, color: cat.color, background: `${cat.color}15`, borderRadius: 4, padding: '2px 8px', flexShrink: 0, marginTop: 2 }}>{n.category}</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{n.summary}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
