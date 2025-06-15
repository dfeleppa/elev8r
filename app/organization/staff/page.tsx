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
import { UserCheck, Search, UserPlus, Mail, Phone, Calendar } from 'lucide-react'

// Sample staff data
const staffMembers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@organization.com',
    role: 'Head Coach',
    department: 'Training',
    joinDate: '2023-01-15',
    phone: '(555) 123-4567',
    status: 'active'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@organization.com',
    role: 'Assistant Coach',
    department: 'Training',
    joinDate: '2023-03-20',
    phone: '(555) 234-5678',
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.w@organization.com',
    role: 'Facility Manager',
    department: 'Operations',
    joinDate: '2022-11-08',
    phone: '(555) 345-6789',
    status: 'active'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@organization.com',
    role: 'Nutritionist',
    department: 'Health',
    joinDate: '2023-05-12',
    phone: '(555) 456-7890',
    status: 'active'
  }
]

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout currentPage="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-muted-foreground">
              Manage your organization's staff members and their roles
            </p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Staff Member
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffMembers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Dept</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {staffMembers.filter(s => s.department === 'Training').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operations</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {staffMembers.filter(s => s.department === 'Operations').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Dept</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {staffMembers.filter(s => s.department === 'Health').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
            <CardDescription>
              View and manage all staff members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff by name, email, role, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Staff Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                        {searchTerm ? 'No staff found matching your search.' : 'No staff members found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="mr-1 h-3 w-3" />
                              {staff.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{staff.role}</Badge>
                        </TableCell>
                        <TableCell>{staff.department}</TableCell>
                        <TableCell>
                          <div className="text-sm flex items-center">
                            <Phone className="mr-1 h-3 w-3" />
                            {staff.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(staff.joinDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                            {staff.status}
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
