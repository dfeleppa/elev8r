'use client'

import { use } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Clock, Users, AlertCircle, Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TasksPageProps {
  params: Promise<{
    orgId: string
  }>
}

export default function TasksPage({ params }: TasksPageProps) {
  const { orgId } = use(params)
  
  return (
    <DashboardLayout currentPage={`org-${orgId}-tasks`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage tasks, assignments, and team productivity
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +3 since yesterday
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Being worked on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Tasks</CardTitle>
                  <CardDescription>
                    Latest tasks and their status
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">Update membership pricing</h4>
                    <p className="text-sm text-muted-foreground">Due: Tomorrow</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">In Progress</Badge>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                      JD
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">Prepare monthly newsletter</h4>
                    <p className="text-sm text-muted-foreground">Due: Friday</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">To Do</Badge>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium">
                      SM
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">Equipment maintenance check</h4>
                    <p className="text-sm text-muted-foreground">Due: Next week</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Completed</Badge>
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium">
                      MJ
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg border-red-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-red-700">Submit quarterly report</h4>
                    <p className="text-sm text-red-500">Overdue: 2 days</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Overdue</Badge>
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-medium">
                      AB
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Productivity</CardTitle>
              <CardDescription>
                Track team performance and workload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                      JD
                    </div>
                    <div>
                      <h4 className="font-medium">John Doe</h4>
                      <p className="text-sm text-muted-foreground">Staff Member</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">5 Active</p>
                    <p className="text-xs text-muted-foreground">12 Completed</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium">
                      SM
                    </div>
                    <div>
                      <h4 className="font-medium">Sarah Miller</h4>
                      <p className="text-sm text-muted-foreground">Marketing Lead</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">3 Active</p>
                    <p className="text-xs text-muted-foreground">18 Completed</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium">
                      MJ
                    </div>
                    <div>
                      <h4 className="font-medium">Mike Johnson</h4>
                      <p className="text-sm text-muted-foreground">Facilities</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">2 Active</p>
                    <p className="text-xs text-muted-foreground">8 Completed</p>
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
