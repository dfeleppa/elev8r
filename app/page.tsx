"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/hooks/use-profile"
import { toast } from "sonner"
import AppAdminDashboard from "@/components/app-admin-dashboard"
import EnhancedLayout from "@/components/layouts/enhanced-layout"
import OrganizationSelector from "@/components/organization-selector"
import { DashboardWidget } from "@/components/dashboard/dashboard-widget"
import { ProfileSetup } from "@/components/profile-setup"

// ELEV8 Logo Component using the actual logo image
function ELEV8Logo() {
  return (
    <div className="flex flex-col items-center gap-2 mb-8">
      <img 
        src="/images/Elev8rlogo.png" 
        alt="ELEV8 Logo" 
        className="w-12 h-12 object-contain"
      />
      <span className="text-2xl font-bold tracking-tight">ELEV8</span>
    </div>
  )
}

export default function AuthPage() {
  const { user, signIn, signUp, signOut, loading } = useAuth()
  const { profile, organizations, loading: profileLoading } = useProfile()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [isAppAdmin, setIsAppAdmin] = useState(false)
  const [orgMode, setOrgMode] = useState<"create" | "join" | "none">("create")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    organizationName: "",
    existingOrgCode: "",
  })
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle navigation for authenticated users
  useEffect(() => {
    if (user && profile && !profileLoading) {
      if (profile.is_app_admin) {
        console.log('App admin detected, redirecting to admin dashboard')
        router.push('/admin')
      } else if (organizations && organizations.length > 0) {
        console.log('User has organizations, redirecting to dashboard')
        router.push('/dashboard')
      }
    }
  }, [user, profile, profileLoading, organizations, router])
  // Prevent hydration mismatch by showing loading until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <ELEV8Logo />
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <ELEV8Logo />
              <p>Authenticating...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (mode === "login") {
        await signIn(formData.email, formData.password)
        toast.success("Successfully signed in!")
      } else {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match")
          return
        }        // Validate organization info based on role and mode
        if (!isAppAdmin) {
          if (orgMode === 'create' && !formData.organizationName.trim()) {
            toast.error("Organization name is required")
            return
          }
          if (orgMode === 'join' && !formData.existingOrgCode.trim()) {
            toast.error("Organization code is required to join existing organization")
            return
          }
          // No validation needed for orgMode === 'none'
        }        // Create user metadata
        const metadata = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          is_app_admin: isAppAdmin,
          ...(!isAppAdmin && orgMode === 'create' && { 
            organization_name: formData.organizationName 
          }),
          ...(!isAppAdmin && orgMode === 'join' && { 
            organization_code: formData.existingOrgCode 
          })
          // For orgMode === 'none', no organization metadata is included
        }
        
        await signUp(formData.email, formData.password, metadata)
        toast.success("Account created successfully! Please check your email to confirm.")
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }  // If user is logged in, show role-based dashboard
  if (user) {
    console.log('User is logged in:', { user: user.id, profile, organizations })
    
    // If profile is still loading, show loading state
    if (profileLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <ELEV8Logo />
                <p>Loading your profile...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    
    // If user doesn't have a profile, show profile setup
    if (!profile) {
      console.log('No profile found, showing profile setup')
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <ELEV8Logo />
              <h1 className="text-2xl font-bold mt-4">Welcome to ELEV8!</h1>
              <p className="text-muted-foreground mb-6">
                Signed in as {user.email}
              </p>
            </div>
            
            <ProfileSetup />

            <div className="text-center">
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )
    }    // Show App Admin Dashboard for app admins
    if (profile?.is_app_admin) {
      console.log('App admin detected, showing loading while redirecting')
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <ELEV8Logo />
                <p>Redirecting to Admin Dashboard...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Show Organization Selector for regular users who don't have orgs yet
    if (!organizations || organizations.length === 0) {
      console.log('No organizations found, showing organization selector')
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl space-y-6">
            <div className="text-center">
              <ELEV8Logo />
              <h1 className="text-2xl font-bold mt-4">Welcome to ELEV8!</h1>
              <p className="text-muted-foreground">
                Signed in as {profile?.first_name} {profile?.last_name} ({user.email})
              </p>
            </div>
            
            <div className="flex justify-center">
              <OrganizationSelector />
            </div>

            <div className="text-center">
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )
    }    // Show main dashboard for users with organizations
    console.log('User has organizations, showing loading while redirecting')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <ELEV8Logo />
              <p>Redirecting to Dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <ELEV8Logo />
          </div>
          <CardTitle className="text-2xl">{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
          <CardDescription>
            {mode === "login" ? "Sign in to your ELEV8 account" : "Join ELEV8 to manage your gym experience"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>                <div className="space-y-3">
                  <Label>Account Type:</Label>
                  <Select value={isAppAdmin ? "app-admin" : "user"} onValueChange={(value) => setIsAppAdmin(value === "app-admin")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="app-admin">App Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600">
                    {isAppAdmin 
                      ? "Platform administrator with full system access" 
                      : "Regular user with access to organization features"
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {!isAppAdmin && (
                  <>                    <div className="space-y-3">
                      <Label>Organization:</Label>                      <RadioGroup
                        value={orgMode}
                        onValueChange={(value: "create" | "join" | "none") => setOrgMode(value)}
                        className="space-y-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="create" id="create" />
                            <Label htmlFor="create">Create New Organization</Label>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">
                            Start a new organization and become its administrator
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="join" id="join" />
                            <Label htmlFor="join">Join Existing Organization</Label>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">
                            Join an existing organization using an invitation code
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="none" id="none" />
                            <Label htmlFor="none">Join without an organization</Label>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">
                            Create your account without joining any organization (you can join one later)
                          </p>
                        </div>
                      </RadioGroup>
                    </div>

                    {orgMode === "create" && (
                      <div className="space-y-2">
                        <Label htmlFor="organizationName">Organization Name</Label>
                        <Input
                          id="organizationName"
                          name="organizationName"
                          placeholder="Enter your organization's name"
                          value={formData.organizationName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}

                    {orgMode === "join" && (
                      <div className="space-y-2">
                        <Label htmlFor="existingOrgCode">Organization Code</Label>
                        <Input
                          id="existingOrgCode"
                          name="existingOrgCode"
                          placeholder="Enter organization code to join"
                          value={formData.existingOrgCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting 
                ? (mode === "login" ? "Signing In..." : "Creating Account...")
                : (mode === "login" ? "Sign In" : "Create Account")
              }
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
