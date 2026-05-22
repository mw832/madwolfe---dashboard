'use client'
import type { Profile, Project, Goal, UserTask } from '@/lib/types'

const CAT_COLORS: Record<string, string> = { film: '#6ab87a', distribution: '#6a90b8', marketing: '#8878b0', revenue: '#b89060', company: '#b8b8c8' }
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

export default function Overview({ profile, projects, goals, userTasks }: { profile: Profile; projects: Project[]; goals: Goal[]; userTasks: UserTask[] }) {
  const pendingTasks = userTasks.filter(t => !t.done).length
  const doneTasks = userTasks.filter(t => t.done).length
  const avgGoal = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0
  const urgentTasks = userTasks.filter(t => !t.done && t.priority === 1)

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 500, color: 'rgba(255,255,255,0.88)', marginBottom: 4 }}>Welcome back, {profile.name.split(' ')[0]}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard label="Films in pipeline" value={projects.length} sub="Active slate" color="#6ab87a" />
        <StatCard label="My open tasks" value={pendingTasks} sub={`${doneTasks} completed`} color="#6a90b8" />
        <StatCard label="Goal progress" value={`${avgGoal}%`} sub={`${goals.length} milestones`} color="#b8b8c8" />
        {urgentTasks.length > 0 && <StatCard label="Urgent tasks" value={urgentTasks.length} sub="Need attention" color="#c06060" />}
      </div>
      {urgentTasks.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Urgent — needs attention</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {urgentTasks.slice(0, 3).map(t => (
              <div key={t.id} style={{ background: 'rgba(192,96,96,0.06)', border: '0.5px solid rgba(192,96,96,0.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c06060', flexShrink: 0 }} />
                <span style={{ fontSize: 13, flex: 1 }}>{t.title}</span>
                {t.date && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{t.date}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Productions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {projects.map(p => {
          const ph = STAGE_COLORS[p.currentStage] || STAGE_COLORS['Development']
          return (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{p.genre}</div>
              </div>
              <span style={{ fontSize: 11, background: ph.bg, color: ph.text, border: `0.5px solid ${ph.border}`, borderRadius: 4, padding: '2px 8px', flexShrink: 0 }}>{p.currentStage}</span>
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Key milestones</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {goals.slice(0, 6).map(g => (
          <div key={g.id} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{g.objective}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', flexShrink: 0, marginLeft: 12 }}>{g.target}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ProgressBar pct={g.progress} color={CAT_COLORS[g.category] || '#b8b8c8'} />
              <span style={{ fontSize: 12, minWidth: 32, color: 'rgba(255,255,255,0.4)' }}>{g.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
