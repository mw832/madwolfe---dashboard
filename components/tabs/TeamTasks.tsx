'use client'
import { useState } from 'react'
import type { Profile, UserTask, Project } from '@/lib/types'

const TYPE_COLORS: Record<string, string> = {
  legal: '#b89060', film: '#6ab87a', distribution: '#6a90b8',
  festival: '#b06080', marketing: '#8878b0', company: '#b8b8c8', coordination: '#7ab8b8'
}
const PRI_COLORS: Record<number, string> = { 1: '#c06060', 2: '#b89060', 3: '#6a90b8' }
const PRI_LABELS: Record<number, string> = { 1: 'Urgent', 2: 'Normal', 3: 'Low' }
const TASK_TYPES = ['film', 'distribution', 'marketing', 'festival', 'legal', 'company', 'coordination']

export default function TeamTasks({ profile, allProfiles, allUserTasks, onToggle, onDelete, onAssign, projects, companyTasks, onSaveCompanyTasks }: {
  profile: Profile; allProfiles: Profile[]; allUserTasks: UserTask[]
  onToggle: (id: string) => void; onDelete: (id: string) => void
  onAssign: (t: any) => void; projects: Project[]
  companyTasks: any[]; onSaveCompanyTasks: (t: any[]) => void
}) {
  const [selectedUser, setSelectedUser] = useState<string>(allProfiles.find(p => p.role !== 'admin')?.id || '')
  const [assigning, setAssigning] = useState(false)
  const [addingCompany, setAddingCompany] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', date: '', type: 'film', priority: 2, project: '' })
  const [newCompanyTask, setNewCompanyTask] = useState({ title: '', date: '', type: 'legal', priority: 1 })
  const [activeTab, setActiveTab] = useState<'company' | 'assign'>('company')

  const nonAdminProfiles = allProfiles.filter(p => p.role !== 'admin')
  const userTasksForSelected = allUserTasks.filter(t => t.assigned_to === selectedUser && !t.done)

  const inp = { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.88)', padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }
  const btnStyle = (c: string) => ({ background: `${c}15`, border: `0.5px solid ${c}40`, borderRadius: 6, color: c, padding: '6px 14px', cursor: 'pointer', fontSize: 12 })

  function TaskRow({ task }: { task: UserTask }) {
    const tc = TYPE_COLORS[task.type] || '#b8b8c8'
    const proj = projects.find(p => p.id === task.project)
    return (
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderLeft: `2px solid ${tc}`, borderRadius: '0 10px 10px 0', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {proj && <span style={{ fontSize: 10, color: '#6a90b8', background: 'rgba(106,144,184,0.12)', borderRadius: 4, padding: '1px 6px' }}>{proj.title}</span>}
            <span style={{ fontSize: 10, color: tc, background: `${tc}15`, borderRadius: 4, padding: '1px 6px' }}>{task.type}</span>
            <span style={{ fontSize: 10, color: PRI_COLORS[task.priority], background: `${PRI_COLORS[task.priority]}15`, borderRadius: 4, padding: '1px 6px' }}>{PRI_LABELS[task.priority]}</span>
            {task.date && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{task.date}</span>}
          </div>
        </div>
        <button onClick={() => onDelete(task.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>×</button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Team Tasks</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>Manage company tasks and assign to team members</div>
      <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
        {(['company', 'assign'] as const).map(id => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ background: activeTab === id ? 'rgba(184,184,200,0.08)' : 'transparent', border: 'none', borderBottom: `1.5px solid ${activeTab === id ? '#b8b8c8' : 'transparent'}`, color: activeTab === id ? '#b8b8c8' : 'rgba(255,255,255,0.35)', padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
            {id === 'company' ? 'Company Tasks' : 'Assign to Team'}
          </button>
        ))}
      </div>

      {activeTab === 'company' && (
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>Internal tasks — visible to admin only</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
            {companyTasks.filter((t: any) => !t.done).map((t: any, i: number) => {
              const tc = TYPE_COLORS[t.type] || '#b8b8c8'
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderLeft: `2px solid ${tc}`, borderRadius: '0 10px 10px 0', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div onClick={() => onSaveCompanyTasks(companyTasks.map((x: any, j: number) => j === i ? { ...x, done: !x.done } : x))} style={{ width: 17, height: 17, borderRadius: 4, border: `1.5px solid ${tc}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{t.title}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 10, color: tc, background: `${tc}15`, borderRadius: 4, padding: '1px 6px' }}>{t.type}</span>
                      {t.date && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{t.date}</span>}
                    </div>
                  </div>
                  <button onClick={() => onSaveCompanyTasks(companyTasks.filter((_: any, j: number) => j !== i))} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              )
            })}
          </div>
          {addingCompany ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input placeholder="Task description" value={newCompanyTask.title} onChange={e => setNewCompanyTask(t => ({ ...t, title: e.target.value }))} style={{ ...inp, width: '100%' }} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input type="date" value={newCompanyTask.date} onChange={e => setNewCompanyTask(t => ({ ...t, date: e.target.value }))} style={{ ...inp, flex: 1 }} />
                  <select value={newCompanyTask.type} onChange={e => setNewCompanyTask(t => ({ ...t, type: e.target.value }))} style={inp}>
                    {TASK_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                  <select value={newCompanyTask.priority} onChange={e => setNewCompanyTask(t => ({ ...t, priority: +e.target.value }))} style={inp}>
                    <option value={1}>Urgent</option><option value={2}>Normal</option><option value={3}>Low</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { if (!newCompanyTask.title.trim()) return; onSaveCompanyTasks([...companyTasks, { ...newCompanyTask, done: false }]); setNewCompanyTask({ title: '', date: '', type: 'legal', priority: 1 }); setAddingCompany(false) }} style={btnStyle('#6ab87a')}>Add task</button>
                  <button onClick={() => setAddingCompany(false)} style={btnStyle('rgba(255,255,255,0.3)')}>Cancel</button>
                </div>
              </div>
            </div>
          ) : <button onClick={() => setAddingCompany(true)} style={btnStyle('#b8b8c8')}>+ Add company task</button>}
        </div>
      )}

      {activeTab === 'assign' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {nonAdminProfiles.map(p => (
              <button key={p.id} onClick={() => setSelectedUser(p.id)} style={{ background: selectedUser === p.id ? 'rgba(184,184,200,0.1)' : 'rgba(255,255,255,0.03)', border: `0.5px solid ${selectedUser === p.id ? '#b8b8c8' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, color: selectedUser === p.id ? '#b8b8c8' : 'rgba(255,255,255,0.5)', padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>{p.name.split(' ')[0]}</button>
            ))}
          </div>
          {selectedUser && (
            <div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                {userTasksForSelected.length} pending tasks for {nonAdminProfiles.find(p => p.id === selectedUser)?.name?.split(' ')[0]}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
                {userTasksForSelected.map(t => <TaskRow key={t.id} task={t} />)}
              </div>
              {assigning ? (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input placeholder="Task description" value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} style={{ ...inp, width: '100%' }} />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input type="date" value={newTask.date} onChange={e => setNewTask(t => ({ ...t, date: e.target.value }))} style={{ ...inp, flex: 1 }} />
                      <select value={newTask.project} onChange={e => setNewTask(t => ({ ...t, project: e.target.value }))} style={inp}>
                        <option value="">No project</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                      <select value={newTask.type} onChange={e => setNewTask(t => ({ ...t, type: e.target.value }))} style={inp}>
                        {TASK_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
                      </select>
                      <select value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: +e.target.value }))} style={inp}>
                        <option value={1}>Urgent</option><option value={2}>Normal</option><option value={3}>Low</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { if (!newTask.title.trim()) return; onAssign({ ...newTask, assigned_to: selectedUser, assigned_by: profile.id, private: false }); setNewTask({ title: '', date: '', type: 'film', priority: 2, project: '' }); setAssigning(false) }} style={btnStyle('#6ab87a')}>Assign task</button>
                      <button onClick={() => setAssigning(false)} style={btnStyle('rgba(255,255,255,0.3)')}>Cancel</button>
                    </div>
                  </div>
                </div>
              ) : <button onClick={() => setAssigning(true)} style={btnStyle('#b8b8c8')}>+ Assign task</button>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
