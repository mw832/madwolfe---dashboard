'use client'
import { useState } from 'react'
import type { Profile, Goal } from '@/lib/types'

const CAT_COLORS: Record<string, string> = { film: '#6ab87a', distribution: '#6a90b8', marketing: '#8878b0', revenue: '#b89060', company: '#b8b8c8' }
const CAT_LABELS: Record<string, string> = { film: 'Film & Production', distribution: 'Distribution & Festival', marketing: 'Marketing & Audience', revenue: 'Revenue', company: 'Company' }

function ProgressBar({ pct, color = '#b8b8c8' }: { pct: number; color?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 4, height: 6, width: '100%' }}>
      <div style={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, height: '100%', borderRadius: 4, background: color, transition: 'width 0.4s' }} />
    </div>
  )
}

function StatCard({ label, value, sub, color = '#b8b8c8' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 6, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function Goals({ profile, goals, onSave }: { profile: Profile; goals: Goal[]; onSave?: (g: Goal[]) => void }) {
  const [localGoals, setLocalGoals] = useState(goals)
  const [adding, setAdding] = useState(false)
  const [newGoal, setNewGoal] = useState({ objective: '', target: '', category: 'film' })
  const isAdmin = profile.role === 'admin'
  const avgOKR = localGoals.length ? Math.round(localGoals.reduce((s, g) => s + g.progress, 0) / localGoals.length) : 0

  const inp = { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.88)', padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }
  const btnStyle = (c: string) => ({ background: `${c}15`, border: `0.5px solid ${c}40`, borderRadius: 6, color: c, padding: '6px 14px', cursor: 'pointer', fontSize: 12 })

  function updateProgress(id: number, progress: number) {
    const updated = localGoals.map(g => g.id === id ? { ...g, progress } : g)
    setLocalGoals(updated)
    onSave?.(updated)
  }

  function addGoal() {
    if (!newGoal.objective.trim()) return
    const id = Math.max(...localGoals.map(g => g.id), 0) + 1
    const updated = [...localGoals, { ...newGoal, id, progress: 0 }]
    setLocalGoals(updated)
    onSave?.(updated)
    setNewGoal({ objective: '', target: '', category: 'film' })
    setAdding(false)
  }

  function deleteGoal(id: number) {
    const updated = localGoals.filter(g => g.id !== id)
    setLocalGoals(updated)
    onSave?.(updated)
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard label="Milestones" value={localGoals.length} />
        <StatCard label="Avg progress" value={`${avgOKR}%`} color="#6a90b8" />
        <StatCard label="North star" value="$750k" sub="Annual revenue by 2030" color="#b8b8c8" />
        <StatCard label="Salary target" value="$90k" sub="Each — 4 person team" color="#6ab87a" />
      </div>
      {['film', 'distribution', 'marketing', 'revenue', 'company'].map(cat => {
        const catGoals = localGoals.filter(g => g.category === cat)
        if (!catGoals.length) return null
        const col = CAT_COLORS[cat]
        return (
          <div key={cat} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: col }} />
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{CAT_LABELS[cat]}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {catGoals.map(g => (
                <div key={g.id} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{g.objective}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{g.target}</div>
                    {isAdmin && <button onClick={() => deleteGoal(g.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 14 }}>×</button>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {isAdmin
                      ? <input type="range" min={0} max={100} value={g.progress} onChange={e => updateProgress(g.id, +e.target.value)} style={{ flex: 1, accentColor: col }} />
                      : <div style={{ flex: 1 }}><ProgressBar pct={g.progress} color={col} /></div>
                    }
                    <span style={{ fontSize: 13, fontWeight: 500, minWidth: 36, color: g.progress >= 66 ? '#6ab87a' : g.progress >= 33 ? '#b89060' : 'rgba(255,255,255,0.4)' }}>{g.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      {isAdmin && (
        adding ? (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input placeholder="Milestone description" value={newGoal.objective} onChange={e => setNewGoal(g => ({ ...g, objective: e.target.value }))} style={{ ...inp, width: '100%' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Target (e.g. Q3 2026)" value={newGoal.target} onChange={e => setNewGoal(g => ({ ...g, target: e.target.value }))} style={{ ...inp, flex: 1 }} />
                <select value={newGoal.category} onChange={e => setNewGoal(g => ({ ...g, category: e.target.value }))} style={inp}>
                  {['film','distribution','marketing','revenue','company'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={addGoal} style={btnStyle('#6ab87a')}>Add milestone</button>
                <button onClick={() => setAdding(false)} style={btnStyle('rgba(255,255,255,0.3)')}>Cancel</button>
              </div>
            </div>
          </div>
        ) : <button onClick={() => setAdding(true)} style={{ ...btnStyle('#b8b8c8'), marginTop: 8 }}>+ Add milestone</button>
      )}
      <div style={{ marginTop: 28, background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 18px' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>5-year vision — end of 2030</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
          {[['9–11','Films made'],['$750k','Annual revenue'],['4','Salaried team'],['$90k','Each salary'],['Active','Distribution arm'],['#1','Indie co. in the South']].map(([v, l], i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#b8b8c8' }}>{v}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
