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
      fetchProfile()
    } else {
      setProfile(null)
      setOrganizations([])
      setLoading(false)
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Fetch user's organizations using the helper function
      const { data: orgsData, error: orgsError } = await supabase
        .rpc('get_user_organizations', { user_uuid: user?.id })

      if (orgsError) throw orgsError
      setOrganizations(orgsData || [])    } catch (err: any) {
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
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, is_app_admin')
        .eq('is_active', true)
        .order('first_name')

      if (error) throw error
      return data
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
      throw err
    }
  }

  const getAllOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data    } catch (err: any) {
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
    getAllUsers,
    createOrganizationWithAdmin,    getAllOrganizations,
    refetch: fetchProfile
  }
}
