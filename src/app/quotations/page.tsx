import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QuotationsList from '@/components/quotation/QuotationsList'

export const dynamic = 'force-dynamic'

export default async function SalesQuotationsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Strict redirect removed to prevent loop. Client component handles auth state.
  // if (!user) {
  //   redirect('/auth/login')
  // }

  let profile = null
  if (session?.user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', session.user.id)
      .single()
    profile = data
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-6xl p-8">
        <QuotationsList user={profile} userId={session?.user.id} />
      </div>
    </div>
  )
}
