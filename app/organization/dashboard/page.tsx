'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Users, UserCheck, TrendingUp, Activity, Calendar } from 'lucide-react'

export default function OrganizationDashboardPage() {
  return (
    <DashboardLayout currentPage="organization-dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your organization's performance and metrics
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">
                +2 new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.5%</div>
              <p className="text-xs text-muted-foreground">
                Monthly growth
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest organization updates and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">New member joined</p>
                    <p className="text-xs text-muted-foreground">Sarah Johnson joined the organization</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Staff training completed</p>
                    <p className="text-xs text-muted-foreground">Mike Wilson completed safety training</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">New program launched</p>
                    <p className="text-xs text-muted-foreground">Advanced Training Program is now available</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Scheduled activities and important dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-4 w-4 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Staff Meeting</p>
                    <p className="text-xs text-muted-foreground">Monthly team meeting and updates</p>
                    <p className="text-xs text-muted-foreground">Tomorrow, 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-4 w-4 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">New Member Orientation</p>
                    <p className="text-xs text-muted-foreground">Welcome session for new members</p>
                    <p className="text-xs text-muted-foreground">Friday, 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-4 w-4 text-purple-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Quarterly Review</p>
                    <p className="text-xs text-muted-foreground">Performance and goals assessment</p>
                    <p className="text-xs text-muted-foreground">Next week</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}