"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Helper function to create profile for a user
  const createProfileForUser = async (user: any, metadata: any) => {
    try {
      console.log('Creating profile for user:', user.id, metadata)
      
      // Try to call the handle_new_user function or create profile directly
      console.log('Attempting to create profile...')
      
      // If not app admin, handle organization setup using existing function
      if (!metadata?.is_app_admin && metadata?.organization_name) {
        console.log('Creating organization using existing function:', metadata.organization_name)
        
        const { data: orgResult, error: orgError } = await supabase
          .rpc('create_organization_with_admin', {
            org_name: metadata.organization_name,
            admin_user_id: user.id
          })
        
        console.log('Organization creation result:', { orgResult, orgError })
      }
      
    } catch (profileErr) {
      console.error('Error creating profile manually:', profileErr)
    }
  }

  useEffect(() => {
    setMounted(true)
    
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, 'User ID:', session?.user?.id, 'Session exists:', !!session)
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Handle user signup confirmation
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, checking if profile exists...')
          
          // Small delay to ensure auth state is fully set
          setTimeout(async () => {
            try {
              // Check if user has a profile
              const { data: existingProfile, error: profileCheckError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', session.user.id)
                .single()
              
              console.log('Profile check result:', { existingProfile, profileCheckError })
              
              if (!existingProfile && profileCheckError?.code === 'PGRST116') {
                console.log('No profile found, creating from stored metadata...')
                
                // Try to get stored metadata from signup
                const storedMetadata = localStorage.getItem(`signup_metadata_${session.user.id}`)
                let metadata = session.user.user_metadata
                
                if (storedMetadata) {
                  try {
                    metadata = { ...metadata, ...JSON.parse(storedMetadata) }
                    console.log('Using stored metadata:', metadata)
                    localStorage.removeItem(`signup_metadata_${session.user.id}`)
                  } catch (e) {
                    console.log('Failed to parse stored metadata:', e)
                  }
                }
                
                console.log('Creating profile with metadata:', metadata)
                await createProfileForUser(session.user, metadata)
              } else if (existingProfile) {
                console.log('Profile already exists')
              }
            } catch (error) {
              console.error('Error in auth state change handler:', error)
            }
          }, 500)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('Starting signup with metadata:', metadata)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: undefined // Disable email confirmation for testing
        }
      })
      
      console.log('Signup response:', { data, error })
      
      if (error) {
        console.log('Signup error:', error)
        throw error
      }
      
      // Store metadata for later use when user confirms email
      if (data.user && metadata) {
        console.log('Storing metadata for user:', data.user.id)
        localStorage.setItem(`signup_metadata_${data.user.id}`, JSON.stringify(metadata))
        
        // If user was created but not automatically signed in, try to sign them in
        if (!data.session && data.user.email_confirmed_at) {
          console.log('User confirmed but no session, attempting sign in...')
          // The user might need to sign in manually
        }
      }
      
      return data
    } catch (err) {
      console.log('Signup exception:', err)
      throw err
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
