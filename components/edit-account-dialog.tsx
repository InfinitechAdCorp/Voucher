"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

interface Account {
  id: number
  account_name: string
  account_number: string
  created_at: string
}

interface EditAccountDialogProps {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccountUpdated: () => void
}

export function EditAccountDialog({ account, open, onOpenChange, onAccountUpdated }: EditAccountDialogProps) {
  const [accountName, setAccountName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (account) {
      setAccountName(account.account_name)
      setAccountNumber(account.account_number)
    }
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account) return

    if (!accountName.trim() || !accountNumber.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await api.updateAccount(account.id, accountName.trim(), accountNumber.trim())

      toast({
        title: "Success",
        description: "Account updated successfully",
      })

      onAccountUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating account:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setAccountName("")
    setAccountNumber("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>Update the account information below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-name" className="text-right">
                Name
              </Label>
              <Input
                id="account-name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="col-span-3"
                placeholder="Enter account name"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-number" className="text-right">
                Number
              </Label>
              <Input
                id="account-number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="col-span-3"
                placeholder="Enter account number"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
