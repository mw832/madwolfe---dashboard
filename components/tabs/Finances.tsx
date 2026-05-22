'use client'
import { useState } from 'react'
import type { Project, FinanceEntry } from '@/lib/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) }
function fmtDec(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n) }
const THRESHOLD = 25000

function ProgressBar({ pct, color = '#b8b8c8' }: { pct: number; color?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 4, height: 10, width: '100%' }}>
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

export default function Finances({ finances, onSave, projects }: { finances: any; onSave: (f: any) => void; projects: Project[] }) {
  const [tab, setTab] = useState('overview')
  const [addingRev, setAddingRev] = useState(false)
  const [addingExp, setAddingExp] = useState(false)
  const [newRev, setNewRev] = useState({ label: '', amount: '', date: '', category: 'licensing', project: 'company' })
  const [newExp, setNewExp] = useState({ label: '', amount: '', date: '', category: 'operations', project: 'company' })

  const revenue: FinanceEntry[] = finances?.revenue ?? []
  const expenses: FinanceEntry[] = finances?.expenses ?? []
  const totalRev = revenue.reduce((s, r) => s + r.amount, 0)
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0)
  const net = totalRev - totalExp
  const threshPct = Math.min(Math.round((net / THRESHOLD) * 100), 100)

  const inp = { background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.88)', padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }
  const btnStyle = (c: string) => ({ background: `${c}15`, border: `0.5px solid ${c}40`, borderRadius: 6, color: c, padding: '6px 14px', cursor: 'pointer', fontSize: 12 })

  function FinRow({ item, type }: { item: FinanceEntry; type: 'revenue' | 'expense' }) {
    const col = type === 'revenue' ? '#6ab87a' : '#c06060'
    return (
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderLeft: `2px solid ${col}`, borderRadius: '0 10px 10px 0', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{item.label}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{item.category}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{item.project}</span>
            {item.date && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{item.date}</span>}
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: col }}>{type === 'revenue' ? '+' : '−'}{fmtDec(item.amount)}</div>
        <button onClick={() => {
          if (type === 'revenue') onSave({ ...finances, revenue: revenue.filter(r => r.id !== item.id) })
          else onSave({ ...finances, expenses: expenses.filter(e => e.id !== item.id) })
        }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 16 }}>×</button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total revenue" value={fmt(totalRev)} color="#6ab87a" />
        <StatCard label="Total expenses" value={fmt(totalExp)} color="#c06060" />
        <StatCard label="Net revenue" value={fmt(net)} color={net >= 0 ? '#6ab87a' : '#c06060'} />
        <StatCard label="Threshold" value={`${threshPct}%`} sub={`Team pays at ${fmt(THRESHOLD)}`} color="#b8b8c8" />
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${net >= THRESHOLD ? 'rgba(106,184,122,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Team pay threshold</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: net >= THRESHOLD ? '#6ab87a' : '#b8b8c8' }}>{fmt(net)} / {fmt(THRESHOLD)}</div>
        </div>
        <ProgressBar pct={threshPct} color={net >= THRESHOLD ? '#6ab87a' : '#b8b8c8'} />
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 8, textAlign: 'center' }}>
          {net >= THRESHOLD ? '🎉 Threshold reached — Kaleigh 4%, Grecia 4%, Meghan 3%' : `${fmt(Math.max(THRESHOLD - net, 0))} to go — Kaleigh 4%, Grecia 4%, Meghan 3%`}
        </div>
      </div>
      <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
        {[['overview','All'],['revenue','Revenue'],['expenses','Expenses']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? 'rgba(184,184,200,0.08)' : 'transparent', border: 'none', borderBottom: `1.5px solid ${tab === id ? '#b8b8c8' : 'transparent'}`, color: tab === id ? '#b8b8c8' : 'rgba(255,255,255,0.35)', padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}>{label}</button>
        ))}
      </div>
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[...revenue.map(r => ({ ...r, _t: 'revenue' })), ...expenses.map(e => ({ ...e, _t: 'expense' }))].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((item, i) => <FinRow key={i} item={item as FinanceEntry} type={item._t === 'revenue' ? 'revenue' : 'expense'} />)}
        </div>
      )}
      {tab === 'revenue' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
            {[...revenue].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(r => <FinRow key={r.id} item={r} type="revenue" />)}
          </div>
          {addingRev ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input placeholder="Description" value={newRev.label} onChange={e => setNewRev(r => ({ ...r, label: e.target.value }))} style={{ ...inp, width: '100%' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" placeholder="Amount" value={newRev.amount} onChange={e => setNewRev(r => ({ ...r, amount: e.target.value }))} style={{ ...inp, flex: 1 }} />
                  <input type="date" value={newRev.date} onChange={e => setNewRev(r => ({ ...r, date: e.target.value }))} style={{ ...inp, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={newRev.category} onChange={e => setNewRev(r => ({ ...r, category: e.target.value }))} style={inp}>
                    {['licensing','grant','investment','distribution','services','other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={newRev.project} onChange={e => setNewRev(r => ({ ...r, project: e.target.value }))} style={inp}>
                    <option value="company">Company</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { if (!newRev.label || !newRev.amount) return; const id = Math.max(...revenue.map(r => r.id), 0) + 1; onSave({ ...finances, revenue: [...revenue, { ...newRev, id, amount: parseFloat(newRev.amount) }] }); setNewRev({ label: '', amount: '', date: '', category: 'licensing', project: 'company' }); setAddingRev(false) }} style={btnStyle('#6ab87a')}>Add revenue</button>
                  <button onClick={() => setAddingRev(false)} style={btnStyle('rgba(255,255,255,0.3)')}>Cancel</button>
                </div>
              </div>
            </div>
          ) : <button onClick={() => setAddingRev(true)} style={btnStyle('#6ab87a')}>+ Add revenue</button>}
        </div>
      )}
      {tab === 'expenses' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
            {[...expenses].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(e => <FinRow key={e.id} item={e} type="expense" />)}
          </div>
          {addingExp ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input placeholder="Description" value={newExp.label} onChange={e => setNewExp(x => ({ ...x, label: e.target.value }))} style={{ ...inp, width: '100%' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" placeholder="Amount" value={newExp.amount} onChange={e => setNewExp(x => ({ ...x, amount: e.target.value }))} style={{ ...inp, flex: 1 }} />
                  <input type="date" value={newExp.date} onChange={e => setNewExp(x => ({ ...x, date: e.target.value }))} style={{ ...inp, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={newExp.category} onChange={e => setNewExp(x => ({ ...x, category: e.target.value }))} style={inp}>
                    {['legal','development','production','marketing','operations','travel','equipment','other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={newExp.project} onChange={e => setNewExp(x => ({ ...x, project: e.target.value }))} style={inp}>
                    <option value="company">Company</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { if (!newExp.label || !newExp.amount) return; const id = Math.max(...expenses.map(e => e.id), 0) + 1; onSave({ ...finances, expenses: [...expenses, { ...newExp, id, amount: parseFloat(newExp.amount) }] }); setNewExp({ label: '', amount: '', date: '', category: 'operations', project: 'company' }); setAddingExp(false) }} style={btnStyle('#c06060')}>Add expense</button>
                  <button onClick={() => setAddingExp(false)} style={btnStyle('rgba(255,255,255,0.3)')}>Cancel</button>
                </div>
              </div>
            </div>
          ) : <button onClick={() => setAddingExp(true)} style={btnStyle('#c06060')}>+ Add expense</button>}
        </div>
      )}
    </div>
  )
}
