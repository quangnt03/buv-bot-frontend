"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { LockKeyhole, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { user, changeUserName, changeUserPassword, isLoading } = useAuthStore()
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nameError, setNameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Use placeholder data if user is not available
  const userName = user?.name || "John Doe"
  const userEmail = user?.email || "john.doe@example.com"
  // Get initials for avatar fallback
  const initials = userName
    .split(" ")
    .map((name: string) => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
    
  // Initialize the name field with current user name when component loads
  useState(() => {
    setNewName(userName);
  });
    
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameError('');
    
    // Validate name
    if (!newName.trim()) {
      setNameError('Name cannot be empty');
      return;
    }
    
    try {
      await changeUserName(newName);
      toast.success("Profile information updated successfully");
    } catch (error) {
      if (error instanceof Error) {
        setNameError(error.message);
      } else {
        setNameError('Failed to update profile');
      }
      toast.error("Failed to update profile");
    }
  }
  
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('');
    
    // Validate password
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      await changeUserPassword(currentPassword, newPassword);
      toast.success("Password updated successfully");
      
      // Reset fields and close dialog
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordDialogOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        setPasswordError(error.message);
      } else {
        setPasswordError('Failed to update password');
      }
    }
  }
  
  // Reset password fields when dialog closes
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    }
    setPasswordDialogOpen(open);
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">User Profile</h1>
            <p className="text-muted-foreground">Manage your account information and security settings</p>
          </div>
          <Card className="shadow-sm border-none">
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="/placeholder.svg" alt={userName} />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">{initials}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{userName}</h2>
                <p className="text-muted-foreground">{userEmail}</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmitProfile}>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white" 
                  />
                  {nameError && <p className="text-sm text-red-500">{nameError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={userEmail} className="bg-white" disabled/>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Changes"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => setPasswordDialogOpen(true)}
                    disabled={isLoading}
                  >
                    <LockKeyhole className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
      
      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Your Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your credentials.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitPassword} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                className="bg-white" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                className="bg-white" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
              />
              <p className="text-xs text-gray-500">Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                className="bg-white" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
            
            {passwordError && (
              <div className="text-sm text-red-500 p-2 bg-red-50 rounded border border-red-100">
                {passwordError}
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => handleDialogClose(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

