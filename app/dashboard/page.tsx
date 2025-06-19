"use client"

import { useEffect, useState } from "react"
import { PlusCircle, DollarSign, FileText, Users } from 'lucide-react'
import Link from "next/link"
import SidebarLayout from "@/components/layout/sidebar-layout"
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

export default function DashboardPage() {
  const [recentVouchers, setRecentVouchers] = useState<RecentVoucher[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCashVouchers: 0,
    totalChequeVouchers: 0,
    totalAmount: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch recent cash vouchers
      const cashResponse = await api.getCashVouchers({ per_page: 5 })
      const cashVouchers = cashResponse.success ? (cashResponse.data.data || cashResponse.data) : []
      
      // Fetch recent cheque vouchers
      const chequeResponse = await api.getChequeVouchers()
      const chequeVouchers = chequeResponse.success ? (chequeResponse.data.data || chequeResponse.data) : []
      
      // Combine and format recent vouchers
      const recentCash = cashVouchers.slice(0, 3).map((voucher: any) => ({
        ...voucher,
        type: "cash" as const,
      }))
      
      const recentCheque = chequeVouchers.slice(0, 2).map((voucher: any) => ({
        ...voucher,
        type: "cheque" as const,
      }))
      
      const combined = [...recentCash, ...recentCheque]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
      
      setRecentVouchers(combined)
      
      // Calculate stats
      const totalCashAmount = cashVouchers.reduce((sum: number, voucher: any) => sum + (voucher.amount || 0), 0)
      const totalChequeAmount = chequeVouchers.reduce((sum: number, voucher: any) => sum + (voucher.amount || 0), 0)
      
      setStats({
        totalCashVouchers: cashVouchers.length,
        totalChequeVouchers: chequeVouchers.length,
        totalAmount: totalCashAmount + totalChequeAmount,
      })
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

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
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      approved: "bg-green-100 text-green-800",
      paid: "bg-blue-100 text-blue-800",
    } as const

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status as keyof typeof colors] || colors.draft}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Draft"}
      </span>
    )
  }

  return (
    <SidebarLayout title="Dashboard" description="Welcome to ABIC Realty Accounting System">
      <div className="px-4 py-6 sm:px-0">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Cash Vouchers</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCashVouchers}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Cheque Vouchers</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalChequeVouchers}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Total Amount</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalAmount)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Total Vouchers</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCashVouchers + stats.totalChequeVouchers}</p>
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
                  <DollarSign className="h-6 w-6 text-white" />
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
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Cheque Voucher</h3>
                  <p className="text-sm text-gray-500">Create a new cheque voucher</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/dashboard/vouchers/cheque" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                Create cheque voucher &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="text-center py-8">Loading recent activity...</div>
            ) : recentVouchers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent vouchers found</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentVouchers.map((voucher) => (
                  <li key={`${voucher.type}-${voucher.id}`}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {voucher.type === "cash" ? `Cash Voucher #${voucher.voucher_number}` : `Cheque Voucher #${voucher.cheque_no}`}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          {voucher.status && getStatusBadge(voucher.status)}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {formatAmount(voucher.amount)}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {voucher.paid_to}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>Created on {formatDate(voucher.created_at)}</p>
                        </div>
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
