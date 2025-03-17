"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { useAuthStore } from "@/store/auth-store"

export default function DashboardPage() {
  const { user, accessToken } = useAuthStore()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <SignOutButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-muted-foreground">Username: {user?.username}</p>
                <p className="text-sm text-muted-foreground">Display name: {user?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access Token</CardTitle>
            <CardDescription>Your current access token (truncated)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-md overflow-x-auto">
              <code className="text-xs">
                {accessToken ? `${accessToken.substring(0, 20)}...` : "No token available"}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

