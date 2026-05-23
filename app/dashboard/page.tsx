'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: profile }, { data: allProfiles }, { data: projectsRow }, { data: goalsRow }, { data: userTasks }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('profiles').select('*'),
        supabase.from('projects').select('*').eq('id', 'main').single(),
        supabase.from('goals').select('*').order('id').limit(1).single(),
        supabase.from('user_tasks').select('*').eq('assigned_to', user.id).order('created_at', { ascending: false }),
      ])

      if (!profile) { router.push('/login'); return }

      let allUserTasks: any[] = []
      let financesData = null
      let companyTasksData = null

      if (profile.role === 'admin') {
        const [{ data: aut }, { data: fin }, { data: ct }] = await Promise.all([
          supabase.from('user_tasks').select('*').order('created_at', { ascending: false }),
          supabase.from('finances').select('*').order('id').limit(1).single(),
          supabase.from('company_tasks').select('*').order('id').limit(1).single(),
        ])
        allUserTasks = aut ?? []
        financesData = fin
        companyTasksData = ct
      }

      setData({
        profile,
        allProfiles: allProfiles ?? [],
        initialProjects: projectsRow?.data?.projects ?? [],
        initialGoals: goalsRow?.data?.goals ?? [],
        initialUserTasks: userTasks ?? [],
        initialAllUserTasks: allUserTasks,
        initialFinances: financesData?.data ?? null,
        initialCompanyTasks: companyTasksData?.data?.tasks ?? [],
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
      Loading...
    </div>
  )

  if (!data) return null

  return <Dashboard {...data} />
}
