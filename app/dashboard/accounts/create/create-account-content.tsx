"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"

const CreateAccountContent = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const account_name = formData.get("account_name") as string
    const account_number = formData.get("account_number") as string

    try {
      const data = await api.createAccount(account_name, account_number)

      toast({
        title: "Account created successfully",
        description: `Account ${account_name} has been created`,
      })
      router.push("/dashboard/accounts")
    } catch (error: any) {
      toast({
        title: "Failed to create account",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Action buttons - moved to top */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>New Account Details</CardTitle>
            <CardDescription>Enter the details for the new accounting account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    name="account_name"
                    type="text"
                    placeholder="Enter account name (text and numbers allowed)"
                    required
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">
                    Enter a descriptive name for the account (e.g., "Office Supplies", "Marketing Expenses")
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    name="account_number"
                    type="text"
                    placeholder="Enter account number"
                    required
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">
                    Enter a unique account number (e.g., "1001", "2500", "ACC-001")
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                <Link href="/dashboard/accounts" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Account Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <h4 className="font-medium text-gray-900 mb-2">Account Name Guidelines:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Use descriptive names that clearly identify the account purpose</li>
                <li>Both text and numbers are allowed</li>
                <li>Keep names concise but informative</li>
              </ul>
            </div>
            <div className="text-sm text-gray-600">
              <h4 className="font-medium text-gray-900 mb-2">Account Number Guidelines:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Account numbers must be unique across the system</li>
                <li>Use a consistent numbering scheme for organization</li>
                <li>Consider using prefixes for different account types</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateAccountContent
