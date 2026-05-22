'use client'
import { useState } from 'react'
import type { Profile } from '@/lib/types'

const TEAM_INFO: Record<string, { role: string; duties: string[] }> = {
  kaleigh: { role: 'Director of Marketing & Distribution', duties: ['3x/week posts — Instagram & TikTok', 'Festival research & submissions', 'Creative branding campaigns', 'Short film distribution (festival + YouTube)', 'Future: theatrical & streaming outreach'] },
  grecia: { role: 'Lead Writer & Script Consultant', duties: ['Script drafts — assigned & original', 'Rewrites as directed', 'Script coverage & notes on submissions', 'Casual creative branding input'] },
  meghan: { role: 'Development & Operations Coordinator', duties: ['Script coverage & written notes', 'Communications management', 'Meeting coordination & notes', 'General operations support'] },
}

export default function Team({ profile, allProfiles }: { profile: Profile; allProfiles: Profile[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const teamMembers = allProfiles.filter(p => p.role !== 'admin')

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Team</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>MadWolfe Productions core team</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {teamMembers.map(m => {
          const info = TEAM_INFO[m.role] || { role: m.role, duties: [] }
          const isOpen = expanded === m.id
          const initials = m.name.split(' ').map((n: string) => n[0]).join('')
          return (
            <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
              <div onClick={() => setExpanded(isOpen ? null : m.id)} style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(184,184,200,0.08)', border: '0.5px solid rgba(184,184,200,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#b8b8c8', flexShrink: 0 }}>{initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{m.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{info.role}</div>
                </div>
                <span style={{ fontSize: 11, background: 'rgba(106,184,122,0.1)', color: '#6ab87a', border: '0.5px solid rgba(106,184,122,0.25)', borderRadius: 4, padding: '2px 8px' }}>active</span>
              </div>
              {isOpen && (
                <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', padding: '14px 18px', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Responsibilities</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {info.duties.map((d, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10 }}>
                        <span style={{ color: 'rgba(184,184,200,0.4)', fontSize: 10, marginTop: 4, flexShrink: 0 }}>◆</span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
