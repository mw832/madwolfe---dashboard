import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/Dashboard'

export default async function DashboardPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: allProfiles } = await supabase.from('profiles').select('*')
  const { data: projectsRow } = await supabase.from('projects').select('*').eq('id', 'main').single()
  const { data: goalsRow } = await supabase.from('goals').select('*').order('id').limit(1).single()

  const { data: userTasks } = await supabase
    .from('user_tasks')
    .select('*')
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false })

  let allUserTasks: any[] = []
  if (profile.role === 'admin') {
    const { data } = await supabase.from('user_tasks').select('*').order('created_at', { ascending: false })
    allUserTasks = data ?? []
  }

  let financesData = null
  if (profile.role === 'admin') {
    const { data } = await supabase.from('finances').select('*').order('id').limit(1).single()
    financesData = data
  }

  let companyTasksData = null
  if (profile.role === 'admin') {
    const { data } = await supabase.from('company_tasks').select('*').order('id').limit(1).single()
    companyTasksData = data
  }

  return (
    <Dashboard
      profile={profile}
      allProfiles={allProfiles ?? []}
      initialProjects={projectsRow?.data?.projects ?? []}
      initialGoals={goalsRow?.data?.goals ?? []}
      initialUserTasks={userTasks ?? []}
      initialAllUserTasks={allUserTasks}
      initialFinances={financesData?.data ?? null}
      initialCompanyTasks={companyTasksData?.data?.tasks ?? []}
    />
  )
}
