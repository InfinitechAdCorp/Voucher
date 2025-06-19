"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2 } from "lucide-react"
import type { Account } from "@/types"
import api from "@/lib/api"

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState({
    account_number: "",
    account_name: "",
    account_type: "",
    balance: "0",
  })
  const [error, setError] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await api.get("/accounts")
      setAccounts(response.data)
    } catch (error) {
      console.error("Failed to fetch accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError("")

    try {
      const accountData = {
        ...formData,
        balance: Number.parseFloat(formData.balance),
      }

      if (editingAccount) {
        await api.put(`/accounts/${editingAccount.id}`, accountData)
      } else {
        await api.post("/accounts", accountData)
      }

      fetchAccounts()
      resetForm()
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to save account")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      account_number: account.account_number,
      account_name: account.account_name,
      account_type: account.account_type,
      balance: account.balance.toString(),
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this account?")) {
      try {
        await api.delete(`/accounts/${id}`)
        fetchAccounts()
      } catch (error) {
        console.error("Failed to delete account:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      account_number: "",
      account_name: "",
      account_type: "",
      balance: "0",
    })
    setEditingAccount(null)
    setShowForm(false)
    setError("")
  }

  const getDefaultAccounts = () => [
    { number: "202", name: "Main Holding Account", type: "asset" },
    { number: "443", name: "Client Income", type: "revenue" },
    { number: "483", name: "Company Cash", type: "asset" },
    { number: "554", name: "Owner Equity", type: "equity" },
  ]

  const createDefaultAccounts = async () => {
    const defaultAccounts = getDefaultAccounts()

    for (const account of defaultAccounts) {
      try {
        await api.post("/accounts", {
          account_number: account.number,
          account_name: account.name,
          account_type: account.type,
          balance: 0,
        })
      } catch (error) {
        console.error(`Failed to create account ${account.number}:`, error)
      }
    }

    fetchAccounts()
  }

  if (loading) {
    return <div>Loading accounts...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Account Management</CardTitle>
          <div className="space-x-2">
            <Button onClick={createDefaultAccounts} variant="outline">
              Create Default Accounts
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAccount ? "Edit Account" : "Add New Account"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_name">Account Name</Label>
                    <Input
                      id="account_name"
                      value={formData.account_name}
                      onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select
                      value={formData.account_type}
                      onValueChange={(value) => setFormData({ ...formData, account_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asset">Asset</SelectItem>
                        <SelectItem value="liability">Liability</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="owner">Owner Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="balance">Initial Balance</Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={formLoading}>
                      {formLoading ? "Saving..." : "Save Account"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Number</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.account_number}</TableCell>
                <TableCell>{account.account_name}</TableCell>
                <TableCell className="capitalize">{account.account_type}</TableCell>
                <TableCell>₱{account.balance.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(account)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(account.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
