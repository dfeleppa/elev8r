'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Users, Search, UserPlus, Mail, Calendar, Activity } from 'lucide-react'

// Sample members data
const members = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.j@email.com',
    membershipType: 'Premium',
    joinDate: '2023-01-10',
    lastActive: '2023-12-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.g@email.com',
    membershipType: 'Basic',
    joinDate: '2023-02-15',
    lastActive: '2023-12-14',
    status: 'active'
  },
  {
    id: '3',
    name: 'David Brown',
    email: 'david.b@email.com',
    membershipType: 'Premium',
    joinDate: '2022-11-20',
    lastActive: '2023-12-10',
    status: 'active'
  },
  {
    id: '4',
    name: 'Jennifer Wilson',
    email: 'jennifer.w@email.com',
    membershipType: 'Elite',
    joinDate: '2023-05-08',
    lastActive: '2023-12-15',
    status: 'active'
  },
  {
    id: '5',
    name: 'Robert Taylor',
    email: 'robert.t@email.com',
    membershipType: 'Basic',
    joinDate: '2023-08-12',
    lastActive: '2023-11-30',
    status: 'inactive'
  }
]

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getMembershipBadgeVariant = (type: string) => {
    switch (type) {
      case 'Elite': return 'default'
      case 'Premium': return 'secondary'
      case 'Basic': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <DashboardLayout currentPage="members">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Members</h1>
            <p className="text-muted-foreground">
              Manage your organization's members and their memberships
            </p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                +3 new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter(m => m.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((members.filter(m => m.status === 'active').length / members.length) * 100)}% active rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter(m => m.membershipType === 'Premium' || m.membershipType === 'Elite').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Premium & Elite tiers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Recent registrations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Member Directory</CardTitle>
            <CardDescription>
              View and manage all organization members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members by name, email, or membership type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Members Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Membership</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                        {searchTerm ? 'No members found matching your search.' : 'No members found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="font-medium">{member.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm flex items-center">
                            <Mail className="mr-1 h-3 w-3" />
                            {member.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getMembershipBadgeVariant(member.membershipType)}>
                            {member.membershipType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(member.joinDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(member.lastActive).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
