'use client'

import AppAdminDashboard from '@/components/app-admin-dashboard'
import { useProfile } from '@/hooks/use-profile'
import { Loader2 } from 'lucide-react'

export default function OrganizationsPage() {
  const { profile, loading } = useProfile()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile?.is_app_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You need App Admin privileges to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <AppAdminDashboard />
}
