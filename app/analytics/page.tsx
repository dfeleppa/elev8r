"use client";

import React from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Building2, Activity, Clock } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Insights and metrics for your platform
            </p>
          </div>
        </div>

        {/* Coming Soon Message */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">
              Analytics Dashboard Coming Soon
            </CardTitle>
            <CardDescription className="text-lg">
              We&apos;re building comprehensive analytics to help you understand
              your platform better
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
              {/* Placeholder Analytics Cards */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium">User Analytics</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• User growth trends</li>
                  <li>• Active user metrics</li>
                  <li>• Registration patterns</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium">Organization Metrics</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Organization growth</li>
                  <li>• Member distribution</li>
                  <li>• Activity by organization</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium">Platform Activity</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Daily active users</li>
                  <li>• Feature usage</li>
                  <li>• Performance metrics</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <h3 className="font-medium">Growth Insights</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Monthly growth rates</li>
                  <li>• Retention analysis</li>
                  <li>• Engagement trends</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <h3 className="font-medium">Real-time Data</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Live user activity</li>
                  <li>• Current sessions</li>
                  <li>• System health</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-medium">Custom Reports</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Exportable data</li>
                  <li>• Custom date ranges</li>
                  <li>• Scheduled reports</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                These features will be available in a future update. Stay tuned
                for comprehensive analytics and insights!
              </p>
              <div className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
                <Clock className="h-4 w-4 mr-2" />
                Expected Q2 2024
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}