"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle } from 'lucide-react'
import api from "@/lib/api"

interface Account {
  id: number
  account_name: string
  account_number: string
  created_at: string
}

interface DeleteAccountDialogProps {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccountDeleted: () => void
}

export function DeleteAccountDialog({ account, open, onOpenChange, onAccountDeleted }: DeleteAccountDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!account) return

    setIsLoading(true)
    try {
      await api.deleteAccount(account.id)
      toast({
        title: "Account deleted successfully",
        description: `Account ${account.account_name} has been deleted`,
      })
      onAccountDeleted()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Failed to delete account",
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
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this account? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {account && (
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{account.account_name}</p>
              <p className="text-sm text-gray-500">Account Number: {account.account_number}</p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
