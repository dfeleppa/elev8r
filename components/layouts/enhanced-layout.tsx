"use client"

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { ThemeProvider } from '@/contexts/theme-context'
import EnhancedHeader from './enhanced-header'
import EnhancedSidebar from './enhanced-sidebar'

interface EnhancedLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

const EnhancedLayout: React.FC<EnhancedLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { loading } = useAuth()

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <EnhancedSidebar collapsed={sidebarCollapsed} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <EnhancedHeader toggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default EnhancedLayout
