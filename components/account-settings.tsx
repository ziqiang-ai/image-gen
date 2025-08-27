"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Shield, Trash2 } from "lucide-react"
import { signOut } from "@/lib/actions"
import type { User } from "@supabase/supabase-js"

interface AccountSettingsProps {
  user: User
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [publicProfile, setPublicProfile] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case "google":
        return { name: "Google", color: "bg-red-100 text-red-800" }
      case "github":
        return { name: "GitHub", color: "bg-gray-100 text-gray-800" }
      default:
        return { name: "Email", color: "bg-blue-100 text-blue-800" }
    }
  }

  const provider = user.app_metadata?.provider || "email"
  const providerInfo = getProviderInfo(provider)

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card className="border-2 border-cyan-100 shadow-lg">
        <CardHeader>
          <CardTitle className="font-heading text-cyan-800">Account Information</CardTitle>
          <CardDescription>View your account details and authentication method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Account ID</Label>
              <p className="text-sm text-gray-600 font-mono">{user.id}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Authentication Method</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={providerInfo.color}>{providerInfo.name}</Badge>
                <Shield className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Account Created</Label>
              <p className="text-sm text-gray-600">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Last Sign In</Label>
              <p className="text-sm text-gray-600">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Never"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-2 border-cyan-100 shadow-lg">
        <CardHeader>
          <CardTitle className="font-heading text-cyan-800">Privacy Settings</CardTitle>
          <CardDescription>Control your privacy and notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-sm text-gray-600">Receive updates about your account and new features</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Public Profile</Label>
              <p className="text-sm text-gray-600">Allow others to view your public images and profile</p>
            </div>
            <Switch checked={publicProfile} onCheckedChange={setPublicProfile} />
          </div>
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card className="border-2 border-cyan-100 shadow-lg">
        <CardHeader>
          <CardTitle className="font-heading text-cyan-800">Security Actions</CardTitle>
          <CardDescription>Manage your account security and access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Sign Out</Label>
              <p className="text-sm text-gray-600">Sign out of your account on this device</p>
            </div>
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-red-200 shadow-lg">
        <CardHeader>
          <CardTitle className="font-heading text-red-800 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that will permanently affect your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-red-800">Delete Account</Label>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>

          {showDeleteConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <p className="text-sm text-red-800 font-medium">
                Are you absolutely sure you want to delete your account?
              </p>
              <p className="text-sm text-red-700">
                This will permanently delete all your images, collections, and account data. This action cannot be
                undone.
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    // TODO: Implement account deletion
                    alert("Account deletion is not implemented yet.")
                  }}
                >
                  Yes, Delete My Account
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
