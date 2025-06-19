"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Badge } from "@/components/ui/badge"
import { Search, Edit, X, Eye, Plus, TrashIcon } from 'lucide-react'
import api from "@/lib/api"
import Link from "next/link"

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
  status: "draft" | "approved" | "paid" | "cancelled"
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
    status: "draft" as "draft" | "approved" | "paid" | "cancelled",
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
      status: voucher.status || "draft",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingVoucher) return

    try {
      setIsSaving(true)
      const response = await api.updateCashVoucher(editingVoucher.id.toString(), editFormData)
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

  const handleCancel = async () => {
    if (!cancellingVoucher) return

    try {
      const response = await api.cancelCashVoucher(cancellingVoucher.id.toString())
      if (response.success) {
        await fetchVouchers()
        setIsCancelDialogOpen(false)
        setCancellingVoucher(null)
      }
    } catch (error) {
      console.error("Error cancelling voucher:", error)
      alert("Error cancelling voucher. Please try again.")
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
      particulars_items: prev.particulars_items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
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
      (voucher.particulars && voucher.particulars.toLowerCase().includes(searchTerm.toLowerCase())),
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
    const variants = {
      draft: "secondary",
      approved: "default",
      paid: "destructive",
      cancelled: "outline",
    } as const

    const colors = {
      draft: "bg-gray-100 text-gray-800",
      approved: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || "secondary"}
        className={colors[status as keyof typeof colors]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Manage all cash vouchers</p>
        </div>
        <Link href="/dashboard/vouchers/cash">
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
              <CardTitle>Cash Vouchers</CardTitle>
              <CardDescription>View and manage all cash vouchers in the system</CardDescription>
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
                    <TableHead>Voucher No.</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVouchers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No vouchers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                        <TableCell>{formatAmount(voucher.amount)}</TableCell>
                        <TableCell>{voucher.paid_to}</TableCell>
                        <TableCell>{formatDate(voucher.date)}</TableCell>
                        <TableCell>{getStatusBadge(voucher.status)}</TableCell>
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
                            {/* Removed the disabled condition - now all vouchers can be edited */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(voucher)}
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
                              title={voucher.status === "cancelled" ? "Voucher is already cancelled" : "Cancel voucher"}
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
          )}
        </CardContent>
      </Card>

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
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            {/* Particulars Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Particulars</Label>
                <Button type="button" onClick={addParticularItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {editFormData.particulars_items.length > 0 ? (
                <div className="space-y-3">
                  {editFormData.particulars_items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                      <div className="col-span-7">
                        <Label className="text-sm">Description</Label>
                        <Input
                          placeholder="Enter description"
                          value={item.description}
                          onChange={(e) => updateParticularItem(index, "description", e.target.value)}
                        />
                      </div>
                      <div className="col-span-4">
                        <Label className="text-sm">Amount</Label>
                        <Input
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) => updateParticularItem(index, "amount", e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button type="button" onClick={() => removeParticularItem(index)} size="sm" variant="outline">
                          <TrashIcon className="h-4 w-4" />
                        </Button>
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
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, particulars: e.target.value }))}
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
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>
              )}
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
                <Label htmlFor="approved_name">Approved Name</Label>
                <Input
                  id="approved_name"
                  value={editFormData.approved_name}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, approved_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="approved_date">Approved Date</Label>
                <Input
                  id="approved_date"
                  type="date"
                  value={editFormData.approved_date}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, approved_date: e.target.value }))}
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
                      status: e.target.value as "draft" | "approved" | "paid" | "cancelled",
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
            <DialogTitle>Cash Voucher Details</DialogTitle>
            <DialogDescription>Voucher {viewingVoucher?.voucher_number}</DialogDescription>
          </DialogHeader>
          {viewingVoucher && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Voucher Number:</Label>
                  <p>{viewingVoucher.voucher_number}</p>
                </div>
                <div>
                  <Label className="font-medium">Amount:</Label>
                  <p>{formatAmount(viewingVoucher.amount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Paid To:</Label>
                  <p>{viewingVoucher.paid_to}</p>
                </div>
                <div>
                  <Label className="font-medium">Date:</Label>
                  <p>{formatDate(viewingVoucher.date)}</p>
                </div>
              </div>
              {viewingVoucher.particulars && (
                <div>
                  <Label className="font-medium">Particulars:</Label>
                  <p className="mt-1">{viewingVoucher.particulars}</p>
                </div>
              )}
              {viewingVoucher.particulars_items && viewingVoucher.particulars_items.length > 0 && (
                <div>
                  <Label className="font-medium">Particular Items:</Label>
                  <div className="mt-2 space-y-2">
                    {viewingVoucher.particulars_items.map((item, index) => (
                      <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>{item.description}</span>
                        <span>{formatAmount(Number(item.amount))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Printed Name:</Label>
                  <p>{viewingVoucher.printed_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-medium">Approved Name:</Label>
                  <p>{viewingVoucher.approved_name || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Status:</Label>
                  <div className="mt-1">{getStatusBadge(viewingVoucher.status)}</div>
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Voucher?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel voucher <strong>{cancellingVoucher?.voucher_number}</strong>? This will
              change the status to "cancelled" but you can still edit it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Active</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              Yes, Cancel Voucher
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
