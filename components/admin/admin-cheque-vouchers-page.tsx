"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Edit, Trash2, Eye, Plus } from "lucide-react"
import api from "@/lib/api"
import Link from "next/link"

interface ChequeVoucher {
  id: number
  cheque_no: string
  account_no: string
  paid_to: string
  date: string
  pay_to: string
  cheque_date: string
  amount: number
  printed_name?: string
  approved_date?: string
  created_at: string
  updated_at: string
}

export default function AdminChequeVouchersPage() {
  const [vouchers, setVouchers] = useState<ChequeVoucher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingVoucher, setEditingVoucher] = useState<ChequeVoucher | null>(null)
  const [deletingVoucher, setDeletingVoucher] = useState<ChequeVoucher | null>(null)
  const [viewingVoucher, setViewingVoucher] = useState<ChequeVoucher | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    account_no: "",
    paid_to: "",
    date: "",
    pay_to: "",
    cheque_date: "",
    amount: "",
    printed_name: "",
    approved_date: "",
  })

  useEffect(() => {
    fetchVouchers()
  }, [])

  const fetchVouchers = async () => {
    try {
      setLoading(true)
      const response = await api.getChequeVouchers()
      if (response.success) {
        setVouchers(response.data.data || response.data)
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (voucher: ChequeVoucher) => {
    setEditingVoucher(voucher)
    setEditFormData({
      account_no: voucher.account_no || "",
      paid_to: voucher.paid_to || "",
      date: voucher.date || "",
      pay_to: voucher.pay_to || "",
      cheque_date: voucher.cheque_date || "",
      amount: voucher.amount?.toString() || "",
      printed_name: voucher.printed_name || "",
      approved_date: voucher.approved_date || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingVoucher) return

    try {
      setIsSaving(true)
      const response = await api.updateChequeVoucher(editingVoucher.id.toString(), editFormData)
      if (response.success) {
        await fetchVouchers()
        setIsEditDialogOpen(false)
        setEditingVoucher(null)
      }
    } catch (error) {
      console.error("Error updating voucher:", error)
      alert("Error updating voucher. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingVoucher) return

    try {
      const response = await api.deleteChequeVoucher(deletingVoucher.id.toString())
      if (response.success) {
        await fetchVouchers()
        setIsDeleteDialogOpen(false)
        setDeletingVoucher(null)
      }
    } catch (error) {
      console.error("Error deleting voucher:", error)
      alert("Error deleting voucher. Please try again.")
    }
  }

  const filteredVouchers = vouchers.filter(
    (voucher) =>
      voucher.cheque_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.paid_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.pay_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.account_no.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Manage all cheque vouchers</p>
        </div>
        <Link href="/dashboard/vouchers/cheque">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Voucher
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cheque Vouchers</CardTitle>
              <CardDescription>View and manage all cheque vouchers in the system</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vouchers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading vouchers...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cheque No.</TableHead>
                    <TableHead>Account No.</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid To</TableHead>
                    <TableHead>Pay To</TableHead>
                    <TableHead>Cheque Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVouchers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No vouchers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-medium">{voucher.cheque_no}</TableCell>
                        <TableCell>{voucher.account_no}</TableCell>
                        <TableCell>{formatAmount(voucher.amount)}</TableCell>
                        <TableCell>{voucher.paid_to}</TableCell>
                        <TableCell>{voucher.pay_to}</TableCell>
                        <TableCell>{formatDate(voucher.cheque_date)}</TableCell>
                        <TableCell>{formatDate(voucher.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setViewingVoucher(voucher)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(voucher)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingVoucher(voucher)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Cheque Voucher</DialogTitle>
            <DialogDescription>Update the details of cheque {editingVoucher?.cheque_no}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_no">Account No.</Label>
                <Input
                  id="account_no"
                  value={editFormData.account_no}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, account_no: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paid_to">Paid To</Label>
                <Input
                  id="paid_to"
                  value={editFormData.paid_to}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, paid_to: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay_to">Pay To</Label>
                <Input
                  id="pay_to"
                  value={editFormData.pay_to}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, pay_to: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cheque_date">Cheque Date</Label>
                <Input
                  id="cheque_date"
                  type="date"
                  value={editFormData.cheque_date}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, cheque_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="printed_name">Printed Name</Label>
                <Input
                  id="printed_name"
                  value={editFormData.printed_name}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, printed_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approved_date">Approved Date</Label>
                <Input
                  id="approved_date"
                  type="date"
                  value={editFormData.approved_date}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, approved_date: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cheque Voucher Details</DialogTitle>
            <DialogDescription>Cheque {viewingVoucher?.cheque_no}</DialogDescription>
          </DialogHeader>
          {viewingVoucher && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Cheque Number:</Label>
                  <p>{viewingVoucher.cheque_no}</p>
                </div>
                <div>
                  <Label className="font-medium">Account Number:</Label>
                  <p>{viewingVoucher.account_no}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Amount:</Label>
                  <p>{formatAmount(viewingVoucher.amount)}</p>
                </div>
                <div>
                  <Label className="font-medium">Date:</Label>
                  <p>{formatDate(viewingVoucher.date)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Paid To:</Label>
                  <p>{viewingVoucher.paid_to}</p>
                </div>
                <div>
                  <Label className="font-medium">Pay To:</Label>
                  <p>{viewingVoucher.pay_to}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Cheque Date:</Label>
                  <p>{formatDate(viewingVoucher.cheque_date)}</p>
                </div>
                <div>
                  <Label className="font-medium">Printed Name:</Label>
                  <p>{viewingVoucher.printed_name || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Approved Date:</Label>
                  <p>{viewingVoucher.approved_date ? formatDate(viewingVoucher.approved_date) : "N/A"}</p>
                </div>
                <div>
                  <Label className="font-medium">Created:</Label>
                  <p>{formatDate(viewingVoucher.created_at)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete cheque{" "}
              <strong>{deletingVoucher?.cheque_no}</strong> and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
