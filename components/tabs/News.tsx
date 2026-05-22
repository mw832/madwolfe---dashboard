'use client'
import { useState } from 'react'

const CAT_COLORS: Record<string, string> = { Financing: '#b89060', Distribution: '#6a90b8', Streaming: '#8878b0', Festival: '#6ab87a', 'Box Office': '#b06080' }

export default function News() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  async function fetchNews() {
    setLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: 'Search for the 5 most important independent film industry news stories from the past week. Focus on: financing deals, distribution, streaming, festival announcements, box office. Return ONLY a JSON array, no markdown. Format: [{"headline":"...","summary":"2 sentence summary","category":"Financing|Distribution|Streaming|Festival|Box Office"}]' }]
        })
      })
      const data = await res.json()
      const text = data.content.map((b: any) => b.text || '').join('')
      setNews(JSON.parse(text.replace(/```json|```/g, '').trim()))
    } catch {
      setNews([{ headline: 'Could not load news', summary: 'Check your connection and try again.', category: 'Error' }])
    }
    setLoading(false)
    setFetched(true)
  }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Industry News</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>Live independent film industry updates</div>
      {!fetched && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Fetch the latest from the indie film world</div>
          <button onClick={fetchNews} style={{ background: 'rgba(184,184,200,0.08)', border: '0.5px solid rgba(184,184,200,0.25)', borderRadius: 8, color: '#b8b8c8', padding: '10px 24px', cursor: 'pointer', fontSize: 14 }}>Load news</button>
        </div>
      )}
      {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Scanning film industry news...</div>}
      {fetched && !loading && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {news.map((n, i) => {
              const col = CAT_COLORS[n.category] || '#b8b8c8'
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 18px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: col, background: `${col}15`, borderRadius: 4, padding: '2px 8px', display: 'inline-block', marginBottom: 8 }}>{n.category}</span>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.88)', marginBottom: 6 }}>{n.headline}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{n.summary}</div>
                </div>
              )
            })}
          </div>
          <button onClick={fetchNews} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.35)', padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>Refresh</button>
        </div>
      )}
    </div>
  )
}
