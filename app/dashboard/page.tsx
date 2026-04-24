import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const fullName: string = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'

  return (
    <DashboardClient
      initialTransactions={transactions ?? []}
      userEmail={user.email ?? ''}
      userName={fullName}
    />
  )
}
