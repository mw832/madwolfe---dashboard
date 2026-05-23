'use client'
import { useState } from 'react'
import type { Profile, UserTask, Project } from '@/lib/types'

const TYPE_COLORS: Record<string, string> = {
  legal: '#b89060', film: '#6ab87a', distribution: '#6a90b8',
  festival: '#b06080', marketing: '#8878b0', company: '#b8b8c8', coordination: '#7ab8b8'
}
const PRI_COLORS: Record<number, string> = { 1: '#c06060', 2: '#b89060', 3: '#6a90b8' }
const PRI_LABELS: Record<number, string> = { 1: 'Urgent', 2: 'Normal', 3: 'Low' }
const TASK_TYPES = ['film', 'distribution', 'marketing', 'festival', 'legal', 'coordination']

export default function TeamTasks({ profile, allProfiles, allUserTasks, onToggle, onDelete, onAssign, projects }: {
  profile: Profile; allProfiles: Profile[]; allUserTasks: UserTask[]
  onToggle: (id: string) => void; onDelete: (id: string) => void
  onAssign: (t: any) => void; projects: Project[]
}) {
  const [selectedUser, setSelectedUser] = useState<string>(allProfiles.find(p => p.role !== 'admin')?.id || '')
  const [assigning, setAssigning] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', date: '', type: 'film', priority: 2, project: '' })

  const nonAdminProfiles = allProfiles.filter(p => p.role !== 'admin')
  const userTasksForSelected = allUserTasks.filter(t => t.assigned_to === selectedUser && !t.done)
  const doneTasksForSelected = allUserTasks.filter(t => t.assigned_to === selectedUser && t.done)

  const inp = { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.88)', padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }
  const btnStyle = (c: string) => ({ background: `${c}15`, border: `0.5px solid ${c}40`, borderRadius: 6, color: c, padding: '6px 14px', cursor: 'pointer', fontSize: 12 })

  function TaskRow({ task }: { task: UserTask }) {
    const tc = TYPE_COLORS[task.type] || '#b8b8c8'
    const proj = projects.find(p => p.id === task.project)
    return (
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderLeft: `2px solid ${tc}`, borderRadius: '0 10px 10px 0', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: task.done ? 0.5 : 1 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</div>
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
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>Assign and manage tasks for your team</div>

      {/* Person selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {nonAdminProfiles.map(p => (
          <button key={p.id} onClick={() => setSelectedUser(p.id)} style={{
            background: selectedUser === p.id ? 'rgba(184,184,200,0.1)' : 'rgba(255,255,255,0.03)',
            border: `0.5px solid ${selectedUser === p.id ? '#b8b8c8' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 8, color: selectedUser === p.id ? '#b8b8c8' : 'rgba(255,255,255,0.5)',
            padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: selectedUser === p.id ? 500 : 400
          }}>{p.name.split(' ')[0]}</button>
        ))}
      </div>

      {selectedUser && (
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
            {userTasksForSelected.length} pending · {doneTasksForSelected.length} completed — {nonAdminProfiles.find(p => p.id === selectedUser)?.name}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
            {userTasksForSelected.length === 0 && !assigning && (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', padding: '20px 0' }}>No pending tasks. Assign one below!</div>
            )}
            {userTasksForSelected.map(t => <TaskRow key={t.id} task={t} />)}
          </div>

          {assigning ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
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
                  <button onClick={() => {
                    if (!newTask.title.trim()) return
                    onAssign({ ...newTask, assigned_to: selectedUser, assigned_by: profile.id, private: false })
                    setNewTask({ title: '', date: '', type: 'film', priority: 2, project: '' })
                    setAssigning(false)
                  }} style={btnStyle('#6ab87a')}>Assign task</button>
                  <button onClick={() => setAssigning(false)} style={btnStyle('rgba(255,255,255,0.3)')}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => setAssigning(true)} style={btnStyle('#b8b8c8')}>+ Assign task</button>
          )}

          {doneTasksForSelected.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Completed ({doneTasksForSelected.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {doneTasksForSelected.map(t => <TaskRow key={t.id} task={t} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
