"use client"

import { useEffect, useState } from "react"
import {
  PlusCircle,
  CreditCard,
  Banknote,
  AlertCircle,
  Edit,
  Trash2,
  X,
  CheckCircle,
  FileText,
  Clock,
} from "lucide-react"
import Link from "next/link"
import SidebarLayout from "@/components/layout/sidebar-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import ABICLoader from "@/components/abic-loader"
import api from "@/lib/api"

interface RecentVoucher {
  id: number
  voucher_number?: string
  cheque_no?: string
  amount: number
  paid_to: string
  date: string
  status?: string
  type: "cash" | "cheque"
  created_at: string
}

interface ActivityLog {
  id: number
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

export default function DashboardPage() {
  const [recentVouchers, setRecentVouchers] = useState<RecentVoucher[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalCashVouchers: 0,
    totalChequeVouchers: 0,
    totalCashAmount: 0,
    totalChequeAmount: 0,
    totalAmount: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      console.log("Fetching dashboard data...")

      // Use the new dashboard stats method
      const dashboardResponse = await api.getDashboardStats()
      console.log("Dashboard Response:", dashboardResponse)

      if (dashboardResponse.success && dashboardResponse.data) {
        const data = dashboardResponse.data

        // Set stats
        setStats({
          totalCashVouchers: data.totalCashVouchers || 0,
          totalChequeVouchers: data.totalChequeVouchers || 0,
          totalCashAmount: data.totalCashAmount || 0,
          totalChequeAmount: data.totalChequeAmount || 0,
          totalAmount: data.totalAmount || 0,
        })

        // Combine recent vouchers
        const recentCash = (data.cashVouchers || []).slice(0, 3).map((voucher: any) => ({
          ...voucher,
          type: "cash" as const,
          amount: Number.parseFloat(voucher.amount) || 0,
        }))

        const recentCheque = (data.chequeVouchers || []).slice(0, 2).map((voucher: any) => ({
          ...voucher,
          type: "cheque" as const,
          amount: Number.parseFloat(voucher.amount) || 0,
        }))

        const combined = [...recentCash, ...recentCheque]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)

        setRecentVouchers(combined)
      } else {
        throw new Error("Invalid response format")
      }

      // Fetch dynamic activity logs (this will work even if backend endpoint doesn't exist)
      try {
        const activityResponse = await api.getActivityLogs({ limit: 5 }) // Show only 5 on dashboard
        console.log("Activity Response:", activityResponse)
        if (activityResponse.success && activityResponse.data) {
          setActivityLogs(activityResponse.data)
        }
      } catch (activityError) {
        console.log("Activity logs not available yet, using fallback")
        setActivityLogs([])
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      setError(error.message || "Failed to load dashboard data")
      // Set default values on error
      setStats({
        totalCashVouchers: 0,
        totalChequeVouchers: 0,
        totalCashAmount: 0,
        totalChequeAmount: 0,
        totalAmount: 0,
      })
      setRecentVouchers([])
      setActivityLogs([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      approved: "bg-green-100 text-green-800",
      paid: "bg-blue-100 text-blue-800",
    } as const

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          colors[status as keyof typeof colors] || colors.draft
        }`}
      >
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Draft"}
      </span>
    )
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
      <SidebarLayout title="Dashboard" description="Welcome to ABIC Realty Accounting System">
        <div className="flex items-center justify-center min-h-[400px]">
          <ABICLoader size="lg" text="Loading dashboard data..." className="animate-fade-in" />
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout title="Dashboard" description="Welcome to ABIC Realty Accounting System">
      <div className="px-4 py-6 sm:px-0">
        {/* Refresh Loader Overlay */}
        {refreshing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <ABICLoader size="lg" text="Refreshing dashboard data..." />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}. Please check your API connection and try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {/* Cash Vouchers Count */}
          <div className="bg-white overflow-hidden shadow rounded-lg col-span-1 lg:col-span-2">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <Banknote className="h-8 w-8 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Cash Vouchers</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCashVouchers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cheque Vouchers Count */}
          <div className="bg-white overflow-hidden shadow rounded-lg col-span-1 lg:col-span-2">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <Banknote className="h-8 w-8 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Cheque Vouchers</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalChequeVouchers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Vouchers Count */}
          <div className="bg-white overflow-hidden shadow rounded-lg col-span-1 lg:col-span-2">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                  <Banknote className="h-8 w-8 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Total Vouchers</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalCashVouchers + stats.totalChequeVouchers}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - Highlighted Cash and Cheque Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Cash Vouchers Summary */}
          <div className="bg-gradient-to-r from-green-400 to-green-600 overflow-hidden shadow-lg rounded-lg">
            <div className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Cash Vouchers Total</h3>
                  <p className="text-3xl font-bold mt-2">{formatAmount(stats.totalCashAmount)}</p>
                  <p className="text-green-100 mt-1">
                    {stats.totalCashVouchers} voucher{stats.totalCashVouchers !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-4">
                  <Banknote className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Cheque Vouchers Summary */}
          <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 overflow-hidden shadow-lg rounded-lg">
            <div className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Cheque Vouchers Total</h3>
                  <p className="text-3xl font-bold mt-2">{formatAmount(stats.totalChequeAmount)}</p>
                  <p className="text-indigo-100 mt-1">{stats.totalChequeVouchers} vouchers</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-4">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <PlusCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Create Account</h3>
                  <p className="text-sm text-gray-500">Create a new accounting account</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/dashboard/accounts/create" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Create new account &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <Banknote className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Cash Voucher</h3>
                  <p className="text-sm text-gray-500">Create a new cash voucher</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/dashboard/vouchers/cash" className="text-sm font-medium text-green-600 hover:text-green-500">
                Create cash voucher &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <Banknote className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Cheque Voucher</h3>
                  <p className="text-sm text-gray-500">Create a new cheque voucher</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                href="/dashboard/vouchers/cheque"
                className="text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                Create cheque voucher &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mb-8">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 flex items-center space-x-2"
          >
            {refreshing ? (
              <>
                <div className="w-4 h-4">
                  <ABICLoader size="sm" text="" />
                </div>
                <span>Refreshing...</span>
              </>
            ) : (
              <span>Refresh Data</span>
            )}
          </button>
        </div>

        {/* Recent Activity Section - Enhanced */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <Link href="/dashboard/activity-logs" className="text-sm text-blue-600 hover:text-blue-500">
              View all activity &rarr;
            </Link>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {activityLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No recent activity found</p>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
