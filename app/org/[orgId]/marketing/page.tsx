'use client'

import { use } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Megaphone, TrendingUp, Users, Target, Plus, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MarketingPageProps {
  params: Promise<{
    orgId: string
  }>
}

export default function MarketingPage({ params }: MarketingPageProps) {
  const { orgId } = use(params)
  
  return (
    <DashboardLayout currentPage={`org-${orgId}-marketing`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
            <p className="text-muted-foreground">
              Manage campaigns, promotions, and member engagement
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                2 ending this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reach</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +20% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.40</div>
              <p className="text-xs text-muted-foreground">
                Per dollar spent
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>
                Your latest marketing initiatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Summer Membership Drive</h4>
                    <p className="text-sm text-muted-foreground">Email Campaign • Active</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">85% Open Rate</p>
                    <p className="text-xs text-muted-foreground">456 reached</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">New Class Launch</h4>
                    <p className="text-sm text-muted-foreground">Social Media • Completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">12 Signups</p>
                    <p className="text-xs text-muted-foreground">234 reached</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Referral Program</h4>
                    <p className="text-sm text-muted-foreground">Ongoing • Active</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">8 Referrals</p>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Track your marketing effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Analytics Dashboard</h3>
                  <p className="text-sm">Detailed analytics and reporting will be added here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
