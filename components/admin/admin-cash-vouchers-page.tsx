"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import { Search, Edit, X, Eye, Plus, TrashIcon, Banknote } from 'lucide-react'
import api from "@/lib/api"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import CashVoucherPreview from "@/components/vouchers/cash-voucher-preview"
import ABICLoader from "@/components/abic-loader"

interface CashVoucher {
  id: number
  voucher_number: string
  amount: number
  paid_to: string
  date: string
  particulars?: string
  particulars_items?: Array<{ description: string; amount: string }>
  printed_name?: string
  approved_name?: string
  approved_date?: string
  status: "active" | "approved" | "paid" | "cancelled"
  created_at: string
  updated_at: string
}

interface ParticularItem {
  description: string
  amount: string
}

export default function AdminCashVouchersPage() {
  const [vouchers, setVouchers] = useState<CashVoucher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingVoucher, setEditingVoucher] = useState<CashVoucher | null>(null)
  const [cancellingVoucher, setCancellingVoucher] = useState<CashVoucher | null>(null)
  const [viewingVoucher, setViewingVoucher] = useState<CashVoucher | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    amount: "",
    paid_to: "",
    date: "",
    particulars: "",
    particulars_items: [] as ParticularItem[],
    printed_name: "",
    approved_name: "",
    approved_date: "",
    status: "active" as "active" | "approved" | "paid" | "cancelled",
  })

  useEffect(() => {
    fetchVouchers()
  }, [])

  const fetchVouchers = async () => {
    try {
      setLoading(true)
      const response = await api.getCashVouchers()
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

  const handleEdit = (voucher: CashVoucher) => {
    setEditingVoucher(voucher)
    setEditFormData({
      amount: voucher.amount?.toString() || "",
      paid_to: voucher.paid_to || "",
      date: voucher.date || "",
      particulars: voucher.particulars || "",
      particulars_items: voucher.particulars_items || [],
      printed_name: voucher.printed_name || "",
      approved_name: voucher.approved_name || "",
      approved_date: voucher.approved_date || "",
      status: voucher.status || "active",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingVoucher) return

    try {
      setIsSaving(true)
      // Add validation before saving
      const errors = []
      if (!editFormData.paid_to.trim()) errors.push("Paid to is required")
      if (!editFormData.date) errors.push("Date is required")
      if (
        editFormData.particulars_items.length === 0 &&
        !editFormData.particulars.trim()
      ) {
        errors.push("Particulars are required")
      }
      if (
        editFormData.particulars_items.length === 0 &&
        (!editFormData.amount || Number.parseFloat(editFormData.amount) <= 0)
      ) {
        errors.push("Amount must be greater than 0")
      }

      if (errors.length > 0) {
        toast({
          title: "Validation Error",
          description: errors.join(", "),
          variant: "destructive",
        })
        return
      }

      const response = await api.updateCashVoucher(editingVoucher.id.toString(), editFormData)
      if (response.success) {
        await fetchVouchers()
        setIsEditDialogOpen(false)
        setEditingVoucher(null)
        toast({
          title: "Success",
          description: `Cash voucher ${editingVoucher.voucher_number} has been updated successfully!`,
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

  const handleCancel = async () => {
    if (!cancellingVoucher) return

    try {
      const response = await api.cancelCashVoucher(cancellingVoucher.id.toString())
      if (response.success) {
        await fetchVouchers()
        setIsCancelDialogOpen(false)
        setCancellingVoucher(null)
        toast({
          title: "Success",
          description: `Cash voucher ${cancellingVoucher.voucher_number} has been cancelled successfully.`,
        })
      }
    } catch (error) {
      console.error("Error cancelling voucher:", error)
      toast({
        title: "Error",
        description: "Failed to cancel voucher. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addParticularItem = () => {
    setEditFormData((prev) => ({
      ...prev,
      particulars_items: [...prev.particulars_items, { description: "", amount: "" }],
    }))
  }

  const updateParticularItem = (index: number, field: keyof ParticularItem, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      particulars_items: prev.particulars_items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const removeParticularItem = (index: number) => {
    setEditFormData((prev) => ({
      ...prev,
      particulars_items: prev.particulars_items.filter((_, i) => i !== index),
    }))
  }

  const filteredVouchers = vouchers.filter(
    (voucher) =>
      voucher.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.paid_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (voucher.particulars && voucher.particulars.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "active",
      },
      approved: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Approved",
      },
      paid: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Paid",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Cancelled",
      },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    return (
      <Badge variant="outline" className={`${config.color} font-medium`}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loader Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <ABICLoader size="lg" text="Saving voucher changes..." />
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-7xl mx-auto gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Banknote className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cash Vouchers</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage all cash vouchers in the system
              </p>
            </div>
          </div>
          <Link href="/dashboard/vouchers/cash">
            <Button className="w-full sm:w-auto hover:opacity-90" style={{ backgroundColor: "#b94ba7" }}>
              Create Voucher
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-white border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  All Cash Vouchers
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {filteredVouchers.length} voucher{filteredVouchers.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
              <div className="w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search vouchers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-80 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <ABICLoader size="md" text="Loading cash vouchers..." />
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow className="border-gray-200">
                        <TableHead className="font-semibold text-gray-900">Voucher No.</TableHead>
                        <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                        <TableHead className="font-semibold text-gray-900">Paid To</TableHead>
                        <TableHead className="font-semibold text-gray-900">Date</TableHead>
                        <TableHead className="font-semibold text-gray-900">Status</TableHead>
                        <TableHead className="font-semibold text-gray-900">Created</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVouchers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                            <div className="flex flex-col items-center space-y-2">
                              <Banknote className="h-8 w-8 text-gray-300" />
                              <p>No vouchers found</p>
                              {searchTerm && <p className="text-sm">Try adjusting your search terms</p>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredVouchers.map((voucher, index) => (
                          <TableRow key={voucher.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <TableCell className="font-medium" style={{ color: "#b94ba7" }}>
                              {voucher.voucher_number}
                            </TableCell>
                            <TableCell className="font-semibold" style={{ color: "#b94ba7" }}>
                              {formatAmount(voucher.amount)}
                            </TableCell>
                            <TableCell className="text-gray-900">{voucher.paid_to}</TableCell>
                            <TableCell className="text-gray-600">{formatDate(voucher.date)}</TableCell>
                            <TableCell>{getStatusBadge(voucher.status)}</TableCell>
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
                                  style={{
                                    color: "#b94ba7",
                                    backgroundColor: "transparent",
                                  }}
                                  className="hover:opacity-80"
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
                                    setCancellingVoucher(voucher)
                                    setIsCancelDialogOpen(true)
                                  }}
                                  disabled={voucher.status === "cancelled"}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:text-gray-400 disabled:hover:bg-transparent"
                                  title={
                                    voucher.status === "cancelled"
                                      ? "Voucher is already cancelled"
                                      : "Cancel voucher"
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 space-y-4">
                  {filteredVouchers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <Banknote className="h-8 w-8 text-gray-300" />
                        <p>No vouchers found</p>
                        {searchTerm && <p className="text-sm">Try adjusting your search terms</p>}
                      </div>
                    </div>
                  ) : (
                    filteredVouchers.map((voucher) => (
                      <Card key={voucher.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-green-600">{voucher.voucher_number}</h3>
                                <p className="text-lg font-semibold text-green-600">
                                  {formatAmount(voucher.amount)}
                                </p>
                              </div>
                              {getStatusBadge(voucher.status)}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Paid to:</span> {voucher.paid_to}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Date:</span> {formatDate(voucher.date)}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Created:</span> {formatDate(voucher.created_at)}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setViewingVoucher(voucher)
                                  setIsViewDialogOpen(true)
                                }}
                                className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(voucher)}
                                className="flex-1"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCancellingVoucher(voucher)
                                  setIsCancelDialogOpen(true)
                                }}
                                disabled={voucher.status === "cancelled"}
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 disabled:text-gray-400 disabled:border-gray-200"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Cash Voucher</DialogTitle>
            <DialogDescription>
              Update the details of voucher {editingVoucher?.voucher_number}
              {editingVoucher?.status === "cancelled" && (
                <span className="text-red-600 font-medium"> (Currently Cancelled)</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Particulars Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <Label>Particulars</Label>
                <Button
                  type="button"
                  onClick={addParticularItem}
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {editFormData.particulars_items.length > 0 ? (
                <div className="space-y-3">
                  {editFormData.particulars_items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-7">
                          <Label className="text-sm">Description</Label>
                          <Input
                            placeholder="Enter description"
                            value={item.description}
                            onChange={(e) => updateParticularItem(index, "description", e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <Label className="text-sm">Amount</Label>
                          <Input
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) => updateParticularItem(index, "amount", e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <Button
                            type="button"
                            onClick={() => removeParticularItem(index)}
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="particulars">Particulars (Text)</Label>
                    <Textarea
                      id="particulars"
                      value={editFormData.particulars}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          particulars: e.target.value,
                        }))
                      }
                      rows={4}
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
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label htmlFor="approved_name">Approved Name</Label>
                <Input
                  id="approved_name"
                  value={editFormData.approved_name}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      approved_name: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      status: e.target.value as "active" | "approved" | "paid" | "cancelled",
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="active">Active</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cash Voucher Preview</DialogTitle>
            <DialogDescription>
              <div className="flex items-center space-x-2">
                <span>Voucher {viewingVoucher?.voucher_number}</span>
                {viewingVoucher && getStatusBadge(viewingVoucher.status)}
              </div>
            </DialogDescription>
          </DialogHeader>
          {viewingVoucher && (
            <div className="py-4">
              {/* Voucher Preview */}
              <div className="border border-gray-300 p-6 bg-white rounded-lg overflow-x-auto">
                <CashVoucherPreview
                  formData={{
                    amount: viewingVoucher.amount?.toString() || "",
                    paid_to: viewingVoucher.paid_to || "",
                    voucher_number: viewingVoucher.voucher_number || "",
                    date: viewingVoucher.date || "",
                    particulars: viewingVoucher.particulars || "",
                    particulars_items: viewingVoucher.particulars_items || [],
                    signature: "", // Signatures not stored in admin view
                    printed_name: viewingVoucher.printed_name || "",
                    approved_signature: "",
                    approved_name: viewingVoucher.approved_name || "",
                    approved_date: viewingVoucher.approved_date || "",
                  }}
                />
              </div>

              {/* Additional Info */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="font-medium text-sm text-gray-600">Status:</Label>
                  <div className="mt-1">{getStatusBadge(viewingVoucher.status)}</div>
                </div>
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
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Voucher?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel voucher{" "}
              <strong>{cancellingVoucher?.voucher_number}</strong>? This will change the status to
              "cancelled" but you can still edit it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">No, Keep Active</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              Yes, Cancel Voucher
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
