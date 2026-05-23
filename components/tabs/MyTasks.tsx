'use client'
import { useState } from 'react'
import type { Profile, UserTask, Project } from '@/lib/types'
import { createClient } from '@/lib/supabase'

const TYPE_COLORS: Record<string, string> = {
  legal: '#b89060', film: '#6ab87a', distribution: '#6a90b8',
  festival: '#b06080', marketing: '#8878b0', company: '#b8b8c8', coordination: '#7ab8b8'
}
const PRI_COLORS: Record<number, string> = { 1: '#c06060', 2: '#b89060', 3: '#6a90b8' }
const PRI_LABELS: Record<number, string> = { 1: 'Urgent', 2: 'Normal', 3: 'Low' }
const TASK_TYPES = ['film', 'distribution', 'marketing', 'festival', 'legal', 'coordination']

function TaskRow({ task, onToggle, onDelete, onUpdate, projects }: {
  task: UserTask; onToggle: () => void; onDelete: () => void
  onUpdate: (updated: Partial<UserTask>) => void; projects: Project[]
}) {
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({ title: task.title, date: task.date || '', type: task.type, priority: task.priority, project: task.project || '' })
  const tc = TYPE_COLORS[task.type] || '#b8b8c8'
  const proj = projects.find(p => p.id === task.project)
  const inp = { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.88)', padding: '6px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box' as const }

  if (editing) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.04)', border: `0.5px solid rgba(255,255,255,0.12)`, borderLeft: `2px solid ${tc}`, borderRadius: '0 10px 10px 0', padding: '12px 14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input value={editData.title} onChange={e => setEditData(d => ({ ...d, title: e.target.value }))} style={{ ...inp, width: '100%', fontSize: 13 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input type="date" value={editData.date} onChange={e => setEditData(d => ({ ...d, date: e.target.value }))} style={{ ...inp, flex: 1 }} />
            <select value={editData.project} onChange={e => setEditData(d => ({ ...d, project: e.target.value }))} style={inp}>
              <option value="">No project</option>
              <option value="company">Company</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <select value={editData.type} onChange={e => setEditData(d => ({ ...d, type: e.target.value }))} style={inp}>
              {TASK_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
            <select value={editData.priority} onChange={e => setEditData(d => ({ ...d, priority: +e.target.value }))} style={inp}>
              <option value={1}>Urgent</option><option value={2}>Normal</option><option value={3}>Low</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { onUpdate(editData); setEditing(false) }} style={{ background: 'rgba(106,184,122,0.15)', border: '0.5px solid rgba(106,184,122,0.4)', borderRadius: 6, color: '#6ab87a', padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.3)', padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderLeft: `2px solid ${tc}`, borderRadius: '0 10px 10px 0', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: task.done ? 0.5 : 1 }}>
      <div onClick={onToggle} style={{ width: 17, height: 17, borderRadius: 4, border: `1.5px solid ${tc}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: task.done ? `${tc}22` : 'transparent' }}>
        {task.done && <span style={{ color: tc, fontSize: 10 }}>✓</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, textDecoration: task.done ? 'line-through' : 'none', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {proj && <span style={{ fontSize: 10, color: '#6a90b8', background: 'rgba(106,144,184,0.12)', borderRadius: 4, padding: '1px 6px' }}>{proj.title}</span>}
          {task.project === 'company' && !proj && <span style={{ fontSize: 10, color: '#b8b8c8', background: 'rgba(184,184,200,0.12)', borderRadius: 4, padding: '1px 6px' }}>Company</span>}
          <span style={{ fontSize: 10, color: tc, background: `${tc}15`, borderRadius: 4, padding: '1px 6px' }}>{task.type}</span>
          <span style={{ fontSize: 10, color: PRI_COLORS[task.priority], background: `${PRI_COLORS[task.priority]}15`, borderRadius: 4, padding: '1px 6px' }}>{PRI_LABELS[task.priority]}</span>
          {task.date && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{task.date}</span>}
        </div>
      </div>
      <button onClick={() => setEditing(true)} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 4, color: 'rgba(255,255,255,0.3)', padding: '2px 8px', cursor: 'pointer', fontSize: 11, flexShrink: 0 }}>Edit</button>
      {task.done && <button onClick={onToggle} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 4, color: 'rgba(255,255,255,0.3)', padding: '2px 8px', cursor: 'pointer', fontSize: 11, flexShrink: 0 }}>Undo</button>}
      <button onClick={onDelete} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>×</button>
    </div>
  )
}

export default function MyTasks({ profile, tasks, onToggle, onDelete, onAdd, projects }: {
  profile: Profile; tasks: UserTask[]; onToggle: (id: string) => void
  onDelete: (id: string) => void; onAdd: (t: any) => void; projects: Project[]
}) {
  const [adding, setAdding] = useState(false)
  const [sort, setSort] = useState('priority')
  const [newTask, setNewTask] = useState({ title: '', date: '', type: 'film', priority: 2, project: '' })
  const [localTasks, setLocalTasks] = useState<UserTask[]>(tasks)
  const supabase = createClient()

  // Sync when tasks prop changes
  if (tasks !== localTasks && tasks.length !== localTasks.length) {
    setLocalTasks(tasks)
  }

  async function handleUpdate(id: string, updated: Partial<UserTask>) {
    await supabase.from('user_tasks').update(updated).eq('id', id)
    setLocalTasks(ts => ts.map(t => t.id === id ? { ...t, ...updated } : t))
  }

  const pending = localTasks.filter(t => !t.done).sort((a, b) => sort === 'priority' ? a.priority - b.priority : (a.date || '9999').localeCompare(b.date || '9999'))
  const done = localTasks.filter(t => t.done)

  const inp = { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.88)', padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }
  const btnStyle = (c: string) => ({ background: `${c}15`, border: `0.5px solid ${c}40`, borderRadius: 6, color: c, padding: '6px 14px', cursor: 'pointer', fontSize: 12 })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 3 }}>My Tasks</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{pending.length} pending · {done.length} completed</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['priority', 'date'].map(v => (
            <button key={v} onClick={() => setSort(v)} style={{ background: sort === v ? 'rgba(184,184,200,0.1)' : 'transparent', border: `0.5px solid ${sort === v ? '#b8b8c8' : 'rgba(255,255,255,0.1)'}`, borderRadius: 20, color: sort === v ? '#b8b8c8' : 'rgba(255,255,255,0.35)', padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}>{v === 'priority' ? 'Priority' : 'Date'}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
        {pending.length === 0 && !adding && <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>No pending tasks. Clear queue! 🎬</div>}
        {pending.map(t => <TaskRow key={t.id} task={t} onToggle={() => onToggle(t.id)} onDelete={() => onDelete(t.id)} onUpdate={(u) => handleUpdate(t.id, u)} projects={projects} />)}
      </div>
      {adding ? (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input placeholder="Task description" value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} style={{ ...inp, width: '100%' }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input type="date" value={newTask.date} onChange={e => setNewTask(t => ({ ...t, date: e.target.value }))} style={{ ...inp, flex: 1 }} />
              <select value={newTask.project} onChange={e => setNewTask(t => ({ ...t, project: e.target.value }))} style={inp}>
                <option value="">No project</option>
                <option value="company">Company</option>
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
              <button onClick={() => { if (!newTask.title.trim()) return; onAdd(newTask); setNewTask({ title: '', date: '', type: 'film', priority: 2, project: '' }); setAdding(false) }} style={btnStyle('#6ab87a')}>Add task</button>
              <button onClick={() => setAdding(false)} style={btnStyle('rgba(255,255,255,0.3)')}>Cancel</button>
            </div>
          </div>
        </div>
      ) : <button onClick={() => setAdding(true)} style={btnStyle('#b8b8c8')}>+ Add task</button>}
      {done.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Completed ({done.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {done.map(t => <TaskRow key={t.id} task={t} onToggle={() => onToggle(t.id)} onDelete={() => onDelete(t.id)} onUpdate={(u) => handleUpdate(t.id, u)} projects={projects} />)}
          </div>
        </div>
      )}
    </div>
  )
}
