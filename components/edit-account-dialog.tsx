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

    setIsLoading(true)
    try {
      await api.updateAccount(account.id, accountName, accountNumber)
      toast({
        title: "Account updated successfully",
        description: `Account ${accountName} has been updated`,
      })
      onAccountUpdated()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Failed to update account",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>Make changes to your account details here.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account_name" className="text-right">
                Account Name
              </Label>
              <Input
                id="account_name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account_number" className="text-right">
                Account Number
              </Label>
              <Input
                id="account_number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
