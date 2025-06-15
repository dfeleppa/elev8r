"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import type { UserRole } from '@/lib/supabase'

export type UserProfile = {
  id: string
  email: string
  first_name: string
  last_name: string
  is_app_admin: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Organization = {
  id: string
  name: string
  description: string | null
  code: string
  created_by: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type OrganizationMembership = {
  id: string
  user_id: string
  organization_id: string
  role: UserRole
  is_active: boolean
  joined_at: string
  updated_at: string
  organization?: Organization
}

export type UserOrganization = {
  org_id: string
  org_name: string
  org_code: string
  user_role: UserRole
  is_admin: boolean
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [organizations, setOrganizations] = useState<UserOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching profile for ID:', user.id)
      fetchProfile()
    } else {
      console.log('No user authenticated, clearing profile data')
      setProfile(null)
      setOrganizations([])
      setLoading(false)
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user?.id) {
      console.log('No user ID available for profile fetch')
      return
    }    setLoading(true)
    try {
      console.log('Fetching profile for user:', user.id)
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      console.log('Profile fetch result:', { profileData, profileError })

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('Profile not found, user might need to complete signup')
          setProfile(null)
        } else {
          console.log('Profile fetch error:', profileError)
          throw profileError
        }
      } else {
        console.log('Setting profile data:', profileData)
        setProfile(profileData)
      }

      // Fetch user's organizations using the helper function
      console.log('Fetching organizations for user:', user.id)
      const { data: orgsData, error: orgsError } = await supabase
        .rpc('get_user_organizations', { user_uuid: user?.id })

      console.log('Organizations fetch result:', { orgsData, orgsError })

      if (orgsError) {
        console.log('Organizations fetch error:', orgsError)
        // Don't throw here, organizations might not exist for app-admin users
        setOrganizations([])
      } else {
        setOrganizations(orgsData || [])
      }    } catch (err: any) {
      console.log('Profile fetch exception:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async (profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: user?.id,
          ...profileData
        }])
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const getOrganizationByCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

      if (error) throw error
      
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const getAllUsers = async () => {
    try {
      // First get all users with complete profile info
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*') // Select all fields
        .eq('is_active', true)
        .order('first_name')

      if (usersError) throw usersError

      // Then get organization memberships for each user
      const usersWithOrgs = await Promise.all(
        (users || []).map(async (user) => {
          try {
            const { data: userOrgs, error: orgsError } = await supabase
              .rpc('get_user_organizations', { user_uuid: user.id })

            if (orgsError) {
              console.log(`Error fetching organizations for user ${user.id}:`, orgsError)
              return { ...user, organizations: [] }
            }

            return { ...user, organizations: userOrgs || [] }
          } catch (err) {
            console.log(`Exception fetching organizations for user ${user.id}:`, err)
            return { ...user, organizations: [] }
          }
        })
      )

      return usersWithOrgs
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const createOrganizationWithAdmin = async (orgName: string, adminUserId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('create_organization_with_admin', {
          org_name: orgName,
          admin_user_id: adminUserId
        })

      if (error) throw error
      return data[0] // Returns { organization_id, organization_code }
    } catch (err: any) {
      setError(err.message)
      throw err    }
  }

  const getAllOrganizations = async () => {
    try {
      console.log('getAllOrganizations: Starting fetch...')
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_active', true)
        .order('name')

      console.log('getAllOrganizations result:', { data: orgs, error })
      if (error) throw error

      // Get member counts for each organization
      const orgsWithCounts = await Promise.all(
        (orgs || []).map(async (org) => {
          try {
            const { data: members, error: membersError } = await supabase
              .from('organization_members')
              .select('user_id')
              .eq('organization_id', org.id)
              .eq('is_active', true)

            if (membersError) {
              console.log(`Error fetching members for org ${org.id}:`, membersError)
              return { ...org, member_count: 0 }
            }

            return { ...org, member_count: members?.length || 0 }
          } catch (err) {
            console.log(`Exception fetching members for org ${org.id}:`, err)
            return { ...org, member_count: 0 }
          }
        })
      )

      console.log('getAllOrganizations: Returning data with counts:', orgsWithCounts)
      return orgsWithCounts
    } catch (err: any) {
      console.log('getAllOrganizations error:', err)
      setError(err.message)
      throw err
    }
  }

  const getOrganizationById = async (organizationId: string) => {
    try {
      console.log('getOrganizationById: Starting fetch for', organizationId)
      
      // Get organization details
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .eq('is_active', true)
        .single()

      if (orgError) throw orgError

      // Get organization members with their profile info
      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          role,
          joined_at,
          is_active,
          profiles:user_id (
            id,
            email,
            first_name,
            last_name,
            is_app_admin
          )
        `)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('joined_at', { ascending: false })

      if (membersError) {
        console.log('Error fetching members:', membersError)
        return { ...org, members: [] }
      }

      console.log('getOrganizationById: Returning data:', { ...org, members })
      return { ...org, members: members || [] }
    } catch (err: any) {
      console.log('getOrganizationById error:', err)
      setError(err.message)
      throw err
    }
  }
  const addUserToOrganization = async (userId: string, organizationId: string, role: UserRole = 'member') => {
    try {
      // First check if user is already a member of this organization
      const { data: existingMembership, error: checkError } = await supabase
        .from('organization_memberships')
        .select('id, role')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .maybeSingle()

      if (checkError) throw checkError

      if (existingMembership) {
        throw new Error('User is already a member of this organization')
      }

      // Validate role - don't allow app-admin in memberships
      if (role === 'app-admin') {
        throw new Error('App admin role cannot be assigned to organization memberships')
      }

      const { data, error } = await supabase
        .from('organization_memberships')
        .insert([{
          user_id: userId,
          organization_id: organizationId,
          role: role
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const removeUserFromOrganization = async (userId: string, organizationId: string) => {
    try {
      const { error } = await supabase
        .from('organization_memberships')
        .delete()
        .eq('user_id', userId)
        .eq('organization_id', organizationId)

      if (error) throw error
      return true
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    profile,
    organizations,
    loading,
    error,
    createProfile,
    updateProfile,
    getOrganizationByCode,
    getAllUsers,    createOrganizationWithAdmin,
    getAllOrganizations,
    getOrganizationById,
    refetch: fetchProfile,
    addUserToOrganization,
    removeUserFromOrganization
  }
}
