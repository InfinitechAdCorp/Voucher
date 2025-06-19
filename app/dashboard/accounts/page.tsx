"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Receipt, FileText, Edit, Trash2, Plus } from "lucide-react"
import Link from "next/link"
import SidebarLayout from "@/components/layout/sidebar-layout"
import { EditAccountDialog } from "@/components/edit-account-dialog"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"
import api from "@/lib/api"

interface Account {
  id: number
  account_name: string
  account_number: string
  created_at: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const data = await api.getAccounts()
      setAccounts(data.accounts)
    } catch (error) {
      console.error("Error fetching accounts:", error)
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

  return (
    <SidebarLayout title="Accounts" description="Manage your accounting accounts">
      <div className="space-y-6">
        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div></div>
          <Link href="/dashboard/accounts/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Account
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Accounts</CardTitle>
            <CardDescription>Manage your accounts and create vouchers</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading accounts...</span>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No accounts found</p>
                <Link href="/dashboard/accounts/create">
                  <Button>Create Your First Account</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Created Date</TableHead>
                    {/* <TableHead>Voucher Actions</TableHead> */}
                    <TableHead>Account Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.account_name}</TableCell>
                      <TableCell>{account.account_number}</TableCell>
                      <TableCell>{new Date(account.created_at).toLocaleDateString()}</TableCell>
                      {/* <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/vouchers/cash?account_id=${account.id}`}>
                            <Button size="sm" variant="outline">
                              <Receipt className="h-4 w-4 mr-2" />
                              Cash Voucher
                            </Button>
                          </Link>
                          <Link href={`/dashboard/vouchers/cheque?account_id=${account.id}`}>
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-2" />
                              Cheque Voucher
                            </Button>
                          </Link>
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditAccount(account)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAccount(account)}
                            className="text-red-600 hover:text-red-700"
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
