"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import type { Account } from "@/types"

interface AccountSelectorProps {
  selectedAccountId?: string
  onAccountChange: (accountId: string, account: Account) => void
  disabled?: boolean
  required?: boolean
}

export default function AccountSelector({
  selectedAccountId,
  onAccountChange,
  disabled = false,
  required = false,
}: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching accounts from API...")
      const response = await api.getAccounts()
      console.log("API Response:", response)

      if (response && response.success !== false) {
        // Handle different response structures
        let accountsData: Account[] = []

        if (Array.isArray(response)) {
          accountsData = response
        } else if (response.data) {
          if (Array.isArray(response.data)) {
            accountsData = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            accountsData = response.data.data
          } else if (response.data.accounts && Array.isArray(response.data.accounts)) {
            accountsData = response.data.accounts
          }
        }

        console.log("Processed accounts data:", accountsData)
        setAccounts(accountsData)

        if (accountsData.length === 0) {
          setError("No accounts found. Please create an account first.")
        }
      } else {
        throw new Error(response?.message || "Failed to fetch accounts")
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)

      let errorMessage =
        "Cannot connect to Laravel API server. Please ensure your Laravel server is running on http://localhost:8000"

      if (error instanceof Error) {
        if (error.message.includes("CORS")) {
          errorMessage = "CORS error. Please check your Laravel CORS configuration."
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleAccountChange = (accountId: string) => {
    const selectedAccount = accounts.find((account) => account.id.toString() === accountId)
    if (selectedAccount) {
      onAccountChange(accountId, selectedAccount)
    }
  }

  const handleRetry = () => {
    fetchAccounts()
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Select Account {required && <span className="text-red-500">*</span>}</Label>
        <div className="flex items-center space-x-2 p-3 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-500">Loading accounts...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label>Select Account {required && <span className="text-red-500">*</span>}</Label>
        <div className="p-3 border border-red-200 rounded-md bg-red-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-600">Error: {error}</span>
            <Button onClick={handleRetry} size="sm" variant="outline" className="ml-2 bg-transparent">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Select Account {required && <span className="text-red-500">*</span>}</Label>
      <Select value={selectedAccountId} onValueChange={handleAccountChange} disabled={disabled} required={required}>
        <SelectTrigger>
          <SelectValue placeholder="Choose an account..." />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id.toString()}>
              <div className="flex flex-col">
                <span className="font-medium">{account.account_name}</span>
                <span className="text-sm text-gray-500">
                  Account #{account.account_number}
                  {account.account_type && <span> • {account.account_type}</span>}
                  {account.balance !== undefined && (
                    <span className="ml-2">
                      • Balance: ₱{Number(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {accounts.length === 0 && (
        <p className="text-sm text-gray-500">
          No accounts available.
          <Button variant="link" className="p-0 h-auto ml-1" onClick={handleRetry}>
            Click to retry
          </Button>
        </p>
      )}
    </div>
  )
}
