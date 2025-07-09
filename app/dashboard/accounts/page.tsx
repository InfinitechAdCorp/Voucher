"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Receipt, Edit, Trash2, Plus, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import SidebarLayout from "@/components/layout/sidebar-layout"
import { EditAccountDialog } from "@/components/edit-account-dialog"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"
import ABICLoader from "@/components/abic-loader"
import api from "@/lib/api"

interface Account {
  id: number
  account_name: string
  account_number: string
  created_at: string
}

interface ApiResponse {
  success?: boolean
  data?: Account[] | { data: Account[] }
  accounts?: Account[]
  message?: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.getAccounts()
      console.log("API Response:", response)

      // Handle different response structures safely
      let accountsData: Account[] = []
      if (response) {
        // Check for accounts directly in response
        if (response.accounts && Array.isArray(response.accounts)) {
          accountsData = response.accounts
        }
        // Check for data.accounts structure
        else if (response.data) {
          if (Array.isArray(response.data)) {
            accountsData = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            accountsData = response.data.data
          } else if (response.data.accounts && Array.isArray(response.data.accounts)) {
            accountsData = response.data.accounts
          }
        }
        // Check if response itself is an array
        else if (Array.isArray(response)) {
          accountsData = response
        }
      }

      console.log("Processed accounts data:", accountsData)
      // Ensure we always set an array, even if empty
      setAccounts(accountsData || [])
    } catch (error) {
      console.error("Error fetching accounts:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch accounts")
      // Set empty array on error to prevent undefined issues
      setAccounts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setEditDialogOpen(true)
  }

  const handleDeleteAccount = (account: Account) => {
    setDeletingAccount(account)
    setDeleteDialogOpen(true)
  }

  const handleAccountUpdated = () => {
    fetchAccounts()
  }

  const handleAccountDeleted = () => {
    fetchAccounts()
  }

  const handleRetry = () => {
    setError(null)
    fetchAccounts()
  }

  return (
    <SidebarLayout title="Accounts" description="Manage your accounting accounts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div></div>
          <Link href="/dashboard/accounts/create">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Accounts</CardTitle>
            <CardDescription>Manage your accounts and create vouchers</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <ABICLoader size="md" text="Loading accounts..." />
              </div>
            ) : accounts && accounts.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Receipt className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
                <p className="text-muted-foreground mb-4">Create your first account to start managing vouchers</p>
                <Link href="/dashboard/accounts/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Account
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Account Number</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.account_name}</TableCell>
                          <TableCell className="font-mono">{account.account_number}</TableCell>
                          <TableCell>{new Date(account.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditAccount(account)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAccount(account)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {accounts.map((account) => (
                    <Card key={account.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium text-lg">{account.account_name}</h3>
                            <p className="text-sm text-muted-foreground font-mono">Account #{account.account_number}</p>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(account.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditAccount(account)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAccount(account)}
                              className="text-destructive hover:text-destructive flex-1"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Total accounts: {accounts.length}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Account Dialog */}
      <EditAccountDialog
        account={editingAccount}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onAccountUpdated={handleAccountUpdated}
      />

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        account={deletingAccount}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onAccountDeleted={handleAccountDeleted}
      />
    </SidebarLayout>
  )
}
