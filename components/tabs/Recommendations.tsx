'use client'
import { useState, useCallback } from 'react'
import type { Profile, Project } from '@/lib/types'

const SECTIONS = [
  { id: 'marketing', label: 'PR, Marketing & Social', color: '#b06080' },
  { id: 'business', label: 'Business Strategy', color: '#6a90b8' },
]

export default function Recommendations({ profile, projects }: { profile: Profile; projects: Project[] }) {
  const [activeSection, setActiveSection] = useState('marketing')
  const [recs, setRecs] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [lastFetched, setLastFetched] = useState<Record<string, number>>({})

  const projectNames = projects.map(p => p.title).join(', ')
  const projectStages = projects.map(p => `${p.title} (${p.currentStage})`).join(', ')

  const PROMPTS: Record<string, string> = {
    marketing: `You are a strategic advisor for MadWolfe Productions, a small indie film company based in New Orleans run by Madison Wolfe. They currently have these films in development: ${projectStages}. Give 5 specific, actionable recommendations for their PR, marketing, merch, and social media strategy right now in May 2026. Focus on what they should be doing TODAY to build their brand and audience before their first feature releases. Be specific and practical. Return ONLY a JSON array no markdown: [{"title":"...","description":"2-3 sentence specific recommendation","category":"PR|Marketing|Social|Merch","priority":"high|medium|low"}]`,
    business: `You are a business strategy advisor for MadWolfe Productions, a small indie film company based in New Orleans run by Madison Wolfe. They currently have these films: ${projectStages}. Their goal is $750k annual revenue by 2030 with a 4-person salaried team. Give 5 specific, actionable business recommendations for right now in May 2026. Cover financing strategies, distribution approach, partnerships, revenue streams, and company building. Be specific and practical. Return ONLY a JSON array no markdown: [{"title":"...","description":"2-3 sentence specific recommendation","category":"Financing|Distribution|Partnerships|Revenue|Operations","priority":"high|medium|low"}]`,
  }

  const fetchSection = useCallback(async (sectionId: string) => {
    setLoading(prev => ({ ...prev, [sectionId]: true }))
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: PROMPTS[sectionId] })
      })
      const data = await res.json()
      if (data.news) {
        setRecs(prev => ({ ...prev, [sectionId]: data.news }))
        setLastFetched(prev => ({ ...prev, [sectionId]: Date.now() }))
      }
    } catch {
      setRecs(prev => ({ ...prev, [sectionId]: [] }))
    }
    setLoading(prev => ({ ...prev, [sectionId]: false }))
  }, [PROMPTS])

  const PRI_COLORS: Record<string, string> = { high: '#c06060', medium: '#b89060', low: '#6a90b8' }
  const CAT_COLORS: Record<string, string> = {
    PR: '#b8b8c8', Marketing: '#8878b0', Social: '#b06080', Merch: '#b89060',
    Financing: '#6ab87a', Distribution: '#6a90b8', Partnerships: '#8878b0', Revenue: '#b89060', Operations: '#b8b8c8'
  }

  const currentRecs = recs[activeSection] || []
  const isLoading = loading[activeSection]
  const activeSec = SECTIONS.find(s => s.id === activeSection)!
  const last = lastFetched[activeSection]

  function timeAgo(ts: number) {
    const diff = Math.floor((Date.now() - ts) / 60000)
    if (diff < 1) return 'just now'
    if (diff < 60) return `${diff}m ago`
    return `${Math.floor(diff / 60)}h ago`
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4, color: 'rgba(255,255,255,0.9)' }}>Recommendations</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            {last ? `Generated ${timeAgo(last)}` : 'AI-powered strategic recommendations for MadWolfe'}
          </div>
        </div>
        <button onClick={() => fetchSection(activeSection)} disabled={isLoading} style={{ background: 'rgba(184,184,200,0.08)', border: '0.5px solid rgba(184,184,200,0.2)', borderRadius: 6, color: '#b8b8c8', padding: '6px 14px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: 12, opacity: isLoading ? 0.5 : 1 }}>
          {isLoading ? 'Generating...' : '✦ Generate'}
        </button>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            background: activeSection === s.id ? `${s.color}18` : 'rgba(255,255,255,0.03)',
            border: `0.5px solid ${activeSection === s.id ? s.color : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 20, color: activeSection === s.id ? s.color : 'rgba(255,255,255,0.4)',
            padding: '5px 18px', cursor: 'pointer', fontSize: 12, fontWeight: activeSection === s.id ? 500 : 400
          }}>{s.label}</button>
        ))}
      </div>

      {/* Empty state */}
      {!isLoading && currentRecs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>✦</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
            Get AI-powered recommendations tailored to MadWolfe
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginBottom: 24 }}>
            Based on your current projects: {projectNames}
          </div>
          <button onClick={() => fetchSection(activeSection)} style={{ background: `${activeSec.color}15`, border: `0.5px solid ${activeSec.color}40`, borderRadius: 8, color: activeSec.color, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
            Generate recommendations
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 18px', height: 100, opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* Recs */}
      {!isLoading && currentRecs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentRecs.map((r, i) => {
            const col = CAT_COLORS[r.category] || activeSec.color
            const priCol = PRI_COLORS[r.priority] || '#b8b8c8'
            return (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderLeft: `2px solid ${col}`, borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>{r.title}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: col, background: `${col}15`, borderRadius: 4, padding: '2px 8px' }}>{r.category}</span>
                    <span style={{ fontSize: 10, color: priCol, background: `${priCol}15`, borderRadius: 4, padding: '2px 8px' }}>{r.priority}</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{r.description}</div>
              </div>
            )
          })}
          <button onClick={() => fetchSection(activeSection)} style={{ alignSelf: 'flex-start', marginTop: 8, background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.35)', padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>↻ Regenerate</button>
        </div>
      )}
    </div>
  )
}
