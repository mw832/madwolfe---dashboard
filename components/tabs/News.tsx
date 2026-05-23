'use client'
import { useState, useEffect, useCallback } from 'react'

const CATEGORIES = [
  { id: 'home', label: '⚡ Top Stories', color: '#b8b8c8' },
  { id: 'industry', label: 'Industry', color: '#b8b8c8' },
  { id: 'streaming', label: 'Streaming', color: '#8878b0' },
  { id: 'distribution', label: 'Distribution', color: '#6a90b8' },
  { id: 'social', label: 'Social Trends', color: '#b06080' },
  { id: 'gear', label: 'Film & Gear', color: '#b89060' },
  { id: 'festivals', label: 'Festivals', color: '#6ab87a' },
  { id: 'funding', label: 'Grants & Funding', color: '#c06060' },
]

const CAT_COLORS: Record<string, string> = {
  Industry: '#b8b8c8', Streaming: '#8878b0', Distribution: '#6a90b8',
  Social: '#b06080', Gear: '#b89060', Festival: '#6ab87a', Funding: '#c06060',
  'Box Office': '#b89060',
}

const REFRESH_INTERVAL = 6 * 60 * 60 * 1000

export default function News() {
  const [activeCategory, setActiveCategory] = useState('home')
  const [news, setNews] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [lastFetched, setLastFetched] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)

  const fetchCategory = useCallback(async (categoryId: string) => {
    setLoading(prev => ({ ...prev, [categoryId]: true }))
    setError(null)
    try {
      const res = await fetch(`/api/news?category=${categoryId}`)
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed')
      setNews(prev => ({ ...prev, [categoryId]: data.news }))
      setLastFetched(prev => ({ ...prev, [categoryId]: Date.now() }))
    } catch (e: any) {
      setError('Could not load news. Try refreshing.')
      setNews(prev => ({ ...prev, [categoryId]: [] }))
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
    const interval = setInterval(() => fetchCategory(activeCategory), REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [activeCategory, fetchCategory])

  const currentNews = news[activeCategory] || []
  const isLoading = loading[activeCategory]
  const activeCat = CATEGORIES.find(c => c.id === activeCategory)!
  const last = lastFetched[activeCategory]

  function timeAgo(ts: number) {
    const diff = Math.floor((Date.now() - ts) / 60000)
    if (diff < 1) return 'just now'
    if (diff < 60) return diff + 'm ago'
    return Math.floor(diff / 60) + 'h ago'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4, color: 'rgba(255,255,255,0.9)' }}>Industry Feed</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            {isLoading ? 'Fetching latest stories...' : last ? 'Updated ' + timeAgo(last) + ' · auto-refreshes every 6h' : 'Loading...'}
          </div>
        </div>
        <button onClick={() => fetchCategory(activeCategory)} disabled={isLoading} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.35)', padding: '6px 14px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: 12, opacity: isLoading ? 0.5 : 1 }}>
          ↻ Refresh
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{ background: activeCategory === c.id ? c.color + '18' : 'rgba(255,255,255,0.03)', border: '0.5px solid ' + (activeCategory === c.id ? c.color : 'rgba(255,255,255,0.08)'), borderRadius: 20, color: activeCategory === c.id ? c.color : 'rgba(255,255,255,0.4)', padding: '5px 14px', cursor: 'pointer', fontSize: 12, fontWeight: activeCategory === c.id ? 500 : 400 }}>
            {c.label}
          </button>
        ))}
      </div>
      {error && <div style={{ background: 'rgba(192,96,96,0.08)', border: '0.5px solid rgba(192,96,96,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#c06060' }}>{error}</div>}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 18px', height: 90 }} />
          ))}
        </div>
      )}
      {!isLoading && currentNews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentNews.map((n, i) => {
            const col = CAT_COLORS[n.category] || activeCat.color
            const isHigh = n.importance === 'high'
            return (
              <div key={i} style={{ background: isHigh ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: '0.5px solid ' + (isHigh ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'), borderLeft: '2px solid ' + col, borderRadius: '0 10px 10px 0', padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    {isHigh && activeCategory === 'home' && <div style={{ fontSize: 10, color: col, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Top Story</div>}
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>{n.headline}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 500, color: col, background: col + '15', borderRadius: 4, padding: '2px 8px', flexShrink: 0, marginTop: 2 }}>{n.category}</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{n.summary}</div>
              </div>
            )
          })}
        </div>
      )}
      {!isLoading && currentNews.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Hit refresh to fetch the latest stories.</div>
      )}
    </div>
  )
}
