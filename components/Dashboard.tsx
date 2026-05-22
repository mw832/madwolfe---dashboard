'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Profile, Project, Goal, UserTask, FinanceEntry } from '@/lib/types'
import { getTabs, can } from '@/lib/permissions'
import Overview from './tabs/Overview'
import Productions from './tabs/Productions'
import Goals from './tabs/Goals'
import MyTasks from './tabs/MyTasks'
import TeamTasks from './tabs/TeamTasks'
import Finances from './tabs/Finances'
import Team from './tabs/Team'
import News from './tabs/News'

const TAB_LABELS: Record<string, string> = {
  overview: 'Overview',
  productions: 'Productions',
  goals: 'Goals',
  mytasks: 'My Tasks',
  teamtasks: 'Team Tasks',
  finances: 'Finances',
  team: 'Team',
  news: 'Industry News',
}

interface Props {
  profile: Profile
  allProfiles: Profile[]
  initialProjects: Project[]
  initialGoals: Goal[]
  initialUserTasks: UserTask[]
  initialAllUserTasks: UserTask[]
  initialFinances: { revenue: FinanceEntry[]; expenses: FinanceEntry[] } | null
  initialCompanyTasks: any[]
}

export default function Dashboard({
  profile, allProfiles, initialProjects, initialGoals,
  initialUserTasks, initialAllUserTasks, initialFinances, initialCompanyTasks
}: Props) {
  const [active, setActive] = useState('overview')
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [userTasks, setUserTasks] = useState<UserTask[]>(initialUserTasks)
  const [allUserTasks, setAllUserTasks] = useState<UserTask[]>(initialAllUserTasks)
  const [finances, setFinances] = useState(initialFinances)
  const [companyTasks, setCompanyTasks] = useState(initialCompanyTasks)
  const router = useRouter()
  const supabase = createClient()
  const tabs = getTabs(profile.role)
  const isAdmin = profile.role === 'admin'

  async function saveProjects(updated: Project[]) {
    setProjects(updated)
    await supabase.from('projects').update({ data: { projects: updated }, updated_at: new Date().toISOString() }).eq('id', 'main')
  }

  async function saveGoals(updated: Goal[]) {
    setGoals(updated)
    await supabase.from('goals').update({ data: { goals: updated }, updated_at: new Date().toISOString() }).eq('id', 1)
  }

  async function saveFinances(updated: any) {
    setFinances(updated)
    await supabase.from('finances').update({ data: updated, updated_at: new Date().toISOString() }).eq('id', 1)
  }

  async function saveCompanyTasks(updated: any[]) {
    setCompanyTasks(updated)
    await supabase.from('company_tasks').update({ data: { tasks: updated }, updated_at: new Date().toISOString() }).eq('id', 1)
  }

  async function addUserTask(task: Omit<UserTask, 'id' | 'created_at'>) {
    const { data } = await supabase.from('user_tasks').insert(task).select().single()
    if (data) {
      if (task.assigned_to === profile.id) setUserTasks(t => [data, ...t])
      if (isAdmin) setAllUserTasks(t => [data, ...t])
    }
  }

  async function toggleUserTask(id: string) {
    const task = userTasks.find(t => t.id === id) || allUserTasks.find(t => t.id === id)
    if (!task) return
    await supabase.from('user_tasks').update({ done: !task.done }).eq('id', id)
    setUserTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))
    if (isAdmin) setAllUserTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  async function deleteUserTask(id: string) {
    await supabase.from('user_tasks').delete().eq('id', id)
    setUserTasks(ts => ts.filter(t => t.id !== id))
    if (isAdmin) setAllUserTasks(ts => ts.filter(t => t.id !== id))
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'rgba(255,255,255,0.88)', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 100% 40% at 50% 0%, rgba(100,80,120,0.06) 0%, transparent 60%)', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ borderBottom: '0.5px solid rgba(255,255,255,0.07)', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(184,184,200,0.08)', border: '0.5px solid rgba(184,184,200,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#b8b8c8', fontWeight: 500 }}>MW</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#b8b8c8' }}>MadWolfe Productions</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Internal Dashboard</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{profile.name}</div>
              <button onClick={signOut} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.3)', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {tabs.map(id => (
              <button key={id} onClick={() => setActive(id)} style={{ background: active === id ? 'rgba(184,184,200,0.07)' : 'transparent', border: 'none', borderBottom: active === id ? '1.5px solid #b8b8c8' : '1.5px solid transparent', color: active === id ? '#b8b8c8' : 'rgba(255,255,255,0.35)', padding: '10px 16px', fontSize: 13, fontWeight: active === id ? 500 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
                {TAB_LABELS[id]}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '28px 28px', maxWidth: 1100, margin: '0 auto' }}>
          {active === 'overview' && <Overview profile={profile} projects={projects} goals={goals} userTasks={userTasks} />}
          {active === 'productions' && <Productions profile={profile} projects={projects} onSave={isAdmin ? saveProjects : undefined} />}
          {active === 'goals' && <Goals profile={profile} goals={goals} onSave={isAdmin ? saveGoals : undefined} />}
          {active === 'mytasks' && <MyTasks profile={profile} tasks={userTasks} onToggle={toggleUserTask} onDelete={deleteUserTask} onAdd={(t) => addUserTask({ ...t, assigned_to: profile.id, assigned_by: profile.id, private: false })} projects={projects} />}
          {active === 'teamtasks' && isAdmin && <TeamTasks profile={profile} allProfiles={allProfiles} allUserTasks={allUserTasks} onToggle={toggleUserTask} onDelete={deleteUserTask} onAssign={(task) => addUserTask(task)} projects={projects} companyTasks={companyTasks} onSaveCompanyTasks={saveCompanyTasks} />}
          {active === 'finances' && isAdmin && <Finances finances={finances} onSave={saveFinances} projects={projects} />}
          {active === 'team' && <Team profile={profile} allProfiles={allProfiles} />}
          {active === 'news' && <News />}
        </div>
      </div>
    </div>
  )
}
