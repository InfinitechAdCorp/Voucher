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
import { Search, Edit, Trash2, Eye, Plus, FileText } from 'lucide-react'
import api from "@/lib/api"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import ChequeVoucherPreview from "@/components/vouchers/cheque-voucher-preview"

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

  const { toast } = useToast()

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
      toast({
        title: "Error",
        description: "Failed to load vouchers. Please refresh the page.",
        variant: "destructive",
      })
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

      // Add validation before saving
      const errors = []
      if (!editFormData.account_no.trim()) errors.push("Account No. is required")
      if (!editFormData.paid_to.trim()) errors.push("Paid to is required")
      if (!editFormData.date) errors.push("Date is required")
      if (!editFormData.pay_to.trim()) errors.push("Pay To is required")
      if (!editFormData.cheque_date) errors.push("Cheque Date is required")
      if (!editFormData.amount || Number.parseFloat(editFormData.amount) <= 0) {
        errors.push("Amount must be greater than 0")
      }
      if (!editFormData.printed_name.trim()) errors.push("Printed Name is required")
      if (!editFormData.approved_date) errors.push("Approved Date is required")

      if (errors.length > 0) {
        toast({
          title: "Validation Error",
          description: errors.join(", "),
          variant: "destructive",
        })
        return
      }

      const response = await api.updateChequeVoucher(editingVoucher.id.toString(), editFormData)
      if (response.success) {
        await fetchVouchers()
        setIsEditDialogOpen(false)
        setEditingVoucher(null)
        toast({
          title: "Success",
          description: `Cheque voucher ${editingVoucher.cheque_no} has been updated successfully!`,
        })
      }
    } catch (error) {
      console.error("Error updating voucher:", error)
      toast({
        title: "Error",
        description: "Failed to update voucher. Please try again.",
        variant: "destructive",
      })
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
        toast({
          title: "Success",
          description: `Cheque voucher ${deletingVoucher.cheque_no} has been deleted successfully.`,
        })
      }
    } catch (error) {
      console.error("Error deleting voucher:", error)
      toast({
        title: "Error",
        description: "Failed to delete voucher. Please try again.",
        variant: "destructive",
      })
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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cheque Vouchers</h1>
              <p className="text-gray-600">Manage all cheque vouchers in the system</p>
            </div>
          </div>
          <Link href="/dashboard/vouchers/cheque">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Voucher
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">All Cheque Vouchers</CardTitle>
                <CardDescription className="text-gray-600">
                  {filteredVouchers.length} voucher{filteredVouchers.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search vouchers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-blue-100">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading vouchers...
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-200">
                      <TableHead className="font-semibold text-gray-900">Cheque No.</TableHead>
                      <TableHead className="font-semibold text-gray-900">Account No.</TableHead>
                      <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                      <TableHead className="font-semibold text-gray-900">Paid To</TableHead>
                      <TableHead className="font-semibold text-gray-900">Pay To</TableHead>
                      <TableHead className="font-semibold text-gray-900">Cheque Date</TableHead>
                      <TableHead className="font-semibold text-gray-900">Created</TableHead>
                      <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVouchers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                          <div className="flex flex-col items-center space-y-2">
                            <FileText className="h-8 w-8 text-gray-300" />
                            <p>No vouchers found</p>
                            {searchTerm && (
                              <p className="text-sm">Try adjusting your search terms</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVouchers.map((voucher, index) => (
                        <TableRow key={voucher.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <TableCell className="font-medium text-blue-600">{voucher.cheque_no}</TableCell>
                          <TableCell className="text-gray-900">{voucher.account_no}</TableCell>
                          <TableCell className="font-semibold text-green-600">{formatAmount(voucher.amount)}</TableCell>
                          <TableCell className="text-gray-900">{voucher.paid_to}</TableCell>
                          <TableCell className="text-gray-900">{voucher.pay_to}</TableCell>
                          <TableCell className="text-gray-600">{formatDate(voucher.cheque_date)}</TableCell>
                          <TableCell className="text-gray-600">{formatDate(voucher.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setViewingVoucher(voucher)
                                  setIsViewDialogOpen(true)
                                }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEdit(voucher)}
                                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeletingVoucher(voucher)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
      </div>

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
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      account_no: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={editFormData.date}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paid_to">Paid To</Label>
                <Input
                  id="paid_to"
                  value={editFormData.paid_to}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      paid_to: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay_to">Pay To</Label>
                <Input
                  id="pay_to"
                  value={editFormData.pay_to}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      pay_to: e.target.value,
                    }))
                  }
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
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      cheque_date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={editFormData.amount}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="printed_name">Printed Name</Label>
                <Input
                  id="printed_name"
                  value={editFormData.printed_name}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      printed_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approved_date">Approved Date</Label>
                <Input
                  id="approved_date"
                  type="date"
                  value={editFormData.approved_date}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      approved_date: e.target.value,
                    }))
                  }
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cheque Voucher Preview</DialogTitle>
            <DialogDescription>Cheque {viewingVoucher?.cheque_no}</DialogDescription>
          </DialogHeader>
          {viewingVoucher && (
            <div className="py-4">
              {/* Voucher Preview */}
              <div className="border border-gray-300 p-6 bg-white rounded-lg">
                <ChequeVoucherPreview
                  formData={{
                    account_no: viewingVoucher.account_no || "",
                    paid_to: viewingVoucher.paid_to || "",
                    date: viewingVoucher.date || "",
                    cheque_no: viewingVoucher.cheque_no || "",
                    pay_to: viewingVoucher.pay_to || "",
                    cheque_date: viewingVoucher.cheque_date || "",
                    amount: viewingVoucher.amount?.toString() || "",
                    signature: "", // Signatures not stored in admin view
                    printed_name: viewingVoucher.printed_name || "",
                    approved_date: viewingVoucher.approved_date || "",
                  }}
                />
              </div>

              {/* Additional Info */}
              <div className="mt-6 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="font-medium text-sm text-gray-600">Created:</Label>
                  <div className="text-sm">{formatDate(viewingVoucher.created_at)}</div>
                </div>
                <div>
                  <Label className="font-medium text-sm text-gray-600">Last Updated:</Label>
                  <div className="text-sm">{formatDate(viewingVoucher.updated_at)}</div>
                </div>
                <div>
                  <Label className="font-medium text-sm text-gray-600">Total Amount:</Label>
                  <div className="text-sm font-semibold">{formatAmount(viewingVoucher.amount)}</div>
                </div>
                <div>
                  <Label className="font-medium text-sm text-gray-600">Voucher ID:</Label>
                  <div className="text-sm">#{viewingVoucher.id}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
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
