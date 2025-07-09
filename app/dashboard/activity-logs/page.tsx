"use client"

import { useEffect, useState } from "react"
import {
  PlusCircle,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Banknote,
  FileText,
  Clock,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react"
import SidebarLayout from "@/components/layout/sidebar-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ABICLoader from "@/components/abic-loader"
import api from "@/lib/api"

interface ActivityLog {
  id: number | string
  action: "created" | "updated" | "deleted" | "cancelled" | "approved" | "paid"
  entity_type: "cash_voucher" | "cheque_voucher" | "account" | "user"
  entity_id: number
  entity_name: string
  description: string
  user_name?: string
  created_at: string
  metadata?: {
    amount?: number
    old_values?: any
    new_values?: any
  }
}

export default function ActivityLogsPage() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filtering, setFiltering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    per_page: 10,
    has_more: false,
    has_previous: false,
  })
  const [filters, setFilters] = useState({
    action: "",
    entity_type: "",
    search: "",
  })

  useEffect(() => {
    fetchActivityLogs()
  }, [pagination.current_page])

  const fetchActivityLogs = async (isRefresh = false, isFilter = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else if (isFilter) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await api.getActivityLogs({
        limit: 10,
        page: pagination.current_page,
        ...filters,
      })

      if (response.success && response.data) {
        setActivityLogs(response.data)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error: any) {
      console.error("Error fetching activity logs:", error)
      setError(error.message || "Failed to load activity logs")
      setActivityLogs([])
    } finally {
      setLoading(false)
      setRefreshing(false)
      setFiltering(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 })) // Reset to first page
    fetchActivityLogs(false, true)
  }

  const clearFilters = () => {
    setFilters({ action: "", entity_type: "", search: "" })
    setPagination((prev) => ({ ...prev, current_page: 1 }))
    setTimeout(() => fetchActivityLogs(false, true), 100)
  }

  const handleRefresh = () => {
    fetchActivityLogs(true)
  }

  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }))
  }

  const nextPage = () => {
    if (pagination.has_more) {
      goToPage(pagination.current_page + 1)
    }
  }

  const previousPage = () => {
    if (pagination.has_previous) {
      goToPage(pagination.current_page - 1)
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "created":
        return <PlusCircle className="h-4 w-4 text-green-500" />
      case "updated":
        return <Edit className="h-4 w-4 text-blue-500" />
      case "deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "cancelled":
        return <X className="h-4 w-4 text-orange-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "paid":
        return <Banknote className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadge = (action: string) => {
    const variants = {
      created: "bg-green-100 text-green-800",
      updated: "bg-blue-100 text-blue-800",
      deleted: "bg-red-100 text-red-800",
      cancelled: "bg-orange-100 text-orange-800",
      approved: "bg-green-100 text-green-800",
      paid: "bg-purple-100 text-purple-800",
    } as const

    return (
      <Badge className={variants[action as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    )
  }

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case "cash_voucher":
        return "Cash Voucher"
      case "cheque_voucher":
        return "Cheque Voucher"
      case "account":
        return "Account"
      case "user":
        return "User"
      default:
        return entityType
    }
  }

  if (loading) {
    return (
      <SidebarLayout title="Activity Logs" description="Complete system activity history">
        <div className="flex items-center justify-center min-h-[400px]">
          <ABICLoader size="lg" text="Loading activity logs..." className="animate-fade-in" />
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout title="Activity Logs" description="Complete system activity history">
      <div className="px-4 py-6 sm:px-0">
        {/* Refresh Loader Overlay */}
        {refreshing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <ABICLoader size="lg" text="Refreshing activity logs..." />
            </div>
          </div>
        )}

        {/* Filter Loader Overlay */}
        {filtering && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <ABICLoader size="lg" text="Applying filters..." />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange("action", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
              <Select value={filters.entity_type} onValueChange={(value) => handleFilterChange("entity_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="cash_voucher">Cash Voucher</SelectItem>
                  <SelectItem value="cheque_voucher">Cheque Voucher</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={applyFilters} disabled={filtering}>
                {filtering ? (
                  <>
                    <div className="w-4 h-4 mr-2">
                      <ABICLoader size="sm" text="" />
                    </div>
                    Applying...
                  </>
                ) : (
                  <>
                    <Filter className="h-4 w-4 mr-2" />
                    Apply
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearFilters} disabled={filtering}>
                Clear
              </Button>
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <>
                    <div className="w-4 h-4 mr-2">
                      <ABICLoader size="sm" text="" />
                    </div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {activityLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No activities found</p>
              {(filters.search || filters.action || filters.entity_type) && (
                <p className="text-sm mt-2">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {activityLogs.map((activity) => (
                  <li key={activity.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.action)}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {getActivityBadge(activity.action)}
                              <span className="text-sm text-gray-500">{getEntityTypeLabel(activity.entity_type)}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                              <span>Entity: {activity.entity_name}</span>
                              {activity.metadata?.amount && (
                                <span>Amount: {formatAmount(activity.metadata.amount)}</span>
                              )}
                              {activity.user_name && <span>By: {activity.user_name}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-xs text-gray-500">{formatDateTime(activity.created_at)}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination Controls */}
              {pagination.total_pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button onClick={previousPage} disabled={!pagination.has_previous} variant="outline">
                      Previous
                    </Button>
                    <Button onClick={nextPage} disabled={!pagination.has_more} variant="outline">
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(pagination.current_page * pagination.per_page, pagination.total_items)}
                        </span>{" "}
                        of <span className="font-medium">{pagination.total_items}</span> results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <Button
                          onClick={previousPage}
                          disabled={!pagination.has_previous}
                          variant="outline"
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          Previous
                        </Button>
                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                          const pageNum = Math.max(1, pagination.current_page - 2) + i
                          if (pageNum > pagination.total_pages) return null
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              variant={pageNum === pagination.current_page ? "default" : "outline"}
                              className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                        <Button
                          onClick={nextPage}
                          disabled={!pagination.has_more}
                          variant="outline"
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          Next
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}
