'use client'
import { useState } from 'react'
import type { Profile, Project } from '@/lib/types'
import { can } from '@/lib/permissions'

const STAGES = ['Draft','Development','Packaging','Pre-Production','Production','Post-Production','Festival Circuit','Distribution']
const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Draft': { bg: '#161616', text: '#666', border: '#2a2a2a' },
  'Development': { bg: '#161620', text: '#7878c8', border: '#2a2a48' },
  'Packaging': { bg: '#1a1628', text: '#9878c8', border: '#3a2858' },
  'Pre-Production': { bg: '#162016', text: '#6ab87a', border: '#2a482a' },
  'Production': { bg: '#201608', text: '#b89060', border: '#483010' },
  'Post-Production': { bg: '#201010', text: '#c06060', border: '#481818' },
  'Festival Circuit': { bg: '#181018', text: '#b06080', border: '#381028' },
  'Distribution': { bg: '#0a1420', text: '#6a90b8', border: '#102038' },
}
const STATUS_COLORS: Record<string, string> = { target: '#6a90b8', submitted: '#b89060', accepted: '#6ab87a', rejected: '#c06060', official: '#b06080' }

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) }

function ProgressBar({ pct, color = '#b8b8c8' }: { pct: number; color?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 4, height: 8, width: '100%' }}>
      <div style={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, height: '100%', borderRadius: 4, background: color, transition: 'width 0.4s' }} />
    </div>
  )
}

function ProjectProfile({ project, onBack, onSave, canEdit, canEditFestivals, canEditDistribution }: {
  project: Project; onBack: () => void; onSave?: (p: Project) => void
  canEdit: boolean; canEditFestivals: boolean; canEditDistribution: boolean
}) {
  const [p, setP] = useState<Project>(JSON.parse(JSON.stringify(project)))
  const [addingFest, setAddingFest] = useState(false)
  const [newFest, setNewFest] = useState({ name: '', status: 'target' })
  const set = (k: keyof Project, v: any) => setP(prev => ({ ...prev, [k]: v }))
  const inp = { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.88)', padding: '8px 12px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' as const }
  const btnStyle = (c: string) => ({ background: `${c}15`, border: `0.5px solid ${c}40`, borderRadius: 6, color: c, padding: '6px 14px', cursor: 'pointer', fontSize: 12 })
  const ph = STAGE_COLORS[p.currentStage] || STAGE_COLORS['Development']
  const stageIdx = STAGES.indexOf(p.currentStage)

  const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>{label}</div>
      {children}
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.4)', padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>← Back</button>
        {canEdit && <button onClick={() => { onSave?.(p); onBack() }} style={{ background: 'rgba(184,184,200,0.1)', border: '0.5px solid rgba(184,184,200,0.3)', borderRadius: 6, color: '#b8b8c8', padding: '6px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Save changes</button>}
      </div>

      <div style={{ marginBottom: 24 }}>
        {canEdit
          ? <input value={p.title} onChange={e => set('title', e.target.value)} style={{ ...inp, fontSize: 22, fontWeight: 500, background: 'transparent', border: 'none', borderBottom: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 0, padding: '0 0 6px 0', marginBottom: 12 }} />
          : <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 12 }}>{p.title}</div>
        }
        {canEdit
          ? <select value={p.currentStage} onChange={e => set('currentStage', e.target.value)} style={{ background: ph.bg, color: ph.text, border: `0.5px solid ${ph.border}`, borderRadius: 4, padding: '3px 10px', fontSize: 12, outline: 'none' }}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          : <span style={{ fontSize: 11, background: ph.bg, color: ph.text, border: `0.5px solid ${ph.border}`, borderRadius: 4, padding: '2px 8px' }}>{p.currentStage}</span>
        }
      </div>

      <Section label="Development timeline">
        <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 4 }}>
          {STAGES.map((s, i) => {
            const done = i < stageIdx, isActive = i === stageIdx
            const col = done ? '#6ab87a' : isActive ? '#b8b8c8' : 'rgba(255,255,255,0.15)'
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: col, border: `2px solid ${col}` }} />
                  <div style={{ fontSize: 9, color: isActive ? '#b8b8c8' : done ? '#6ab87a' : 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', maxWidth: 64, textAlign: 'center', lineHeight: 1.3 }}>{s}</div>
                </div>
                {i < STAGES.length - 1 && <div style={{ width: 24, height: 1, background: i < stageIdx ? '#6ab87a' : 'rgba(255,255,255,0.08)', marginBottom: 18 }} />}
              </div>
            )
          })}
        </div>
      </Section>

      <Section label="Core info">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['Genre', 'genre'], ['Format', 'format']].map(([l, k]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>{l}</div>
              {canEdit ? <input value={(p as any)[k]} onChange={e => set(k as keyof Project, e.target.value)} style={inp} /> : <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{(p as any)[k]}</div>}
            </div>
          ))}
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>Shoot start</div>
            {canEdit ? <input type="date" value={p.shootStart} onChange={e => set('shootStart', e.target.value)} style={inp} /> : <div style={{ fontSize: 13 }}>{p.shootStart || 'TBD'}</div>}
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>Shoot wrap</div>
            {canEdit ? <input type="date" value={p.shootWrap} onChange={e => set('shootWrap', e.target.value)} style={inp} /> : <div style={{ fontSize: 13 }}>{p.shootWrap || 'TBD'}</div>}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Budget — {fmt(p.spent)} spent of {fmt(p.budget)}</div>
          <ProgressBar pct={Math.round((p.spent / p.budget) * 100)} color="#b89060" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 5 }}>
            <span>{Math.round((p.spent / p.budget) * 100)}% spent</span>
            <span>{fmt(p.budget - p.spent)} remaining</span>
          </div>
          {canEdit && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>Total budget</div><input type="number" value={p.budget} onChange={e => set('budget', +e.target.value)} style={inp} /></div>
              <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>Spent to date</div><input type="number" value={p.spent} onChange={e => set('spent', +e.target.value)} style={inp} /></div>
            </div>
          )}
        </div>
      </Section>

      <Section label="Logline">
        {canEdit
          ? <textarea value={p.logline} onChange={e => set('logline', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
          : <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{p.logline}</div>
        }
      </Section>

      {p.attachments.length > 0 && (
        <Section label="Notable attachments">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {p.attachments.map((a, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13 }}>{a}</span>
                {canEdit && <button onClick={() => set('attachments', p.attachments.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 15 }}>×</button>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {(canEdit || canEditDistribution) && (
        <Section label="Distribution & sales">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>Sales agent</div>
              <input value={p.salesAgent} onChange={e => set('salesAgent', e.target.value)} placeholder="TBD" style={inp} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>Distributor</div>
              <input value={p.distributor} onChange={e => set('distributor', e.target.value)} placeholder="TBD" style={inp} />
            </div>
          </div>
        </Section>
      )}

      <Section label="Festival targets">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {p.festivals.map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1, fontSize: 13 }}>{f.name}</span>
              {(canEdit || canEditFestivals)
                ? <select value={f.status} onChange={e => set('festivals', p.festivals.map((x, j) => j === i ? { ...x, status: e.target.value } : x))} style={{ background: `${STATUS_COLORS[f.status]}18`, color: STATUS_COLORS[f.status], border: `0.5px solid ${STATUS_COLORS[f.status]}40`, borderRadius: 4, padding: '2px 8px', fontSize: 11, outline: 'none' }}>
                    {['target','submitted','accepted','rejected','official'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                : <span style={{ fontSize: 11, color: STATUS_COLORS[f.status], background: `${STATUS_COLORS[f.status]}15`, borderRadius: 4, padding: '2px 8px' }}>{f.status}</span>
              }
              {canEdit && <button onClick={() => set('festivals', p.festivals.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 15 }}>×</button>}
            </div>
          ))}
        </div>
        {(canEdit || canEditFestivals) && (
          addingFest ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input placeholder="Festival name" value={newFest.name} onChange={e => setNewFest(f => ({ ...f, name: e.target.value }))} style={{ ...inp, flex: 1 }} />
              <select value={newFest.status} onChange={e => setNewFest(f => ({ ...f, status: e.target.value }))} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.88)', padding: '8px 12px', fontSize: 13, outline: 'none' }}>
                {['target','submitted','accepted','rejected','official'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => { if (newFest.name.trim()) { set('festivals', [...p.festivals, { ...newFest }]); setNewFest({ name: '', status: 'target' }); setAddingFest(false) } }} style={btnStyle('#6ab87a')}>Add</button>
              <button onClick={() => setAddingFest(false)} style={btnStyle('rgba(255,255,255,0.3)')}>Cancel</button>
            </div>
          ) : <button onClick={() => setAddingFest(true)} style={btnStyle('#b06080')}>+ Add festival</button>
        )}
      </Section>

      {p.notes && (
        <Section label="Notes">
          {canEdit
            ? <textarea value={p.notes} onChange={e => set('notes', e.target.value)} rows={4} style={{ ...inp, resize: 'vertical', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)' }} />
            : <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{p.notes}</div>
          }
        </Section>
      )}

      {canEdit && <button onClick={() => { onSave?.(p); onBack() }} style={{ background: 'rgba(184,184,200,0.1)', border: '0.5px solid rgba(184,184,200,0.3)', borderRadius: 8, color: '#b8b8c8', padding: '10px 28px', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Save changes</button>}
    </div>
  )
}

export default function Productions({ profile, projects, onSave }: { profile: Profile; projects: Project[]; onSave?: (p: Project[]) => void }) {
  const [open, setOpen] = useState<string | null>(null)
  const isAdmin = profile.role === 'admin'
  const canEditFest = can(profile.role, 'canEditFestivals') as boolean
  const canEditDist = can(profile.role, 'canEditDistribution') as boolean

  if (open) {
    const proj = projects.find(p => p.id === open)!
    return <ProjectProfile project={proj} onBack={() => setOpen(null)} onSave={isAdmin ? (updated) => onSave?.(projects.map(p => p.id === updated.id ? updated : p)) : undefined} canEdit={isAdmin} canEditFestivals={canEditFest} canEditDistribution={canEditDist} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>No productions yet. Add one from the admin dashboard.</div>
      )}
      {projects.map(p => {
        const ph = STAGE_COLORS[p.currentStage] || STAGE_COLORS['Development']
        const pct = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0
        return (
          <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>{p.title}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, background: ph.bg, color: ph.text, border: `0.5px solid ${ph.border}`, borderRadius: 4, padding: '2px 8px' }}>{p.currentStage}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{p.genre}</span>
                </div>
              </div>
              <button onClick={() => setOpen(p.id)} style={{ background: 'rgba(184,184,200,0.07)', border: '0.5px solid rgba(184,184,200,0.2)', borderRadius: 6, color: '#b8b8c8', padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>View →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
              {[['Budget', fmt(p.budget), '#b89060'], ['Shoot start', p.shootStart || 'TBD', 'rgba(255,255,255,0.7)'], ['Shoot wrap', p.shootWrap || 'TBD', 'rgba(255,255,255,0.7)'], ['Festivals', `${p.festivals.length} targets`, '#b06080']].map(([l, v, c]) => (
                <div key={l as string} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '9px 12px' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: c as string }}>{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 5 }}>
                <span>Budget spent</span><span>{pct}%</span>
              </div>
              <ProgressBar pct={pct} color="#b89060" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
