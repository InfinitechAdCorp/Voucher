"use client";

import { Suspense } from "react"
import SidebarLayout from "@/components/layout/sidebar-layout"
import CashVoucherPageContent from "./cash-voucher-content"

export default function CashVoucherPage() {
  return (
    <SidebarLayout
      title="Create Cash Voucher"
      description="Create and preview cash voucher with detailed particulars"
    >
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading cash voucher...</p>
            </div>
          </div>
        }
      >
        <CashVoucherPageContent />
      </Suspense>
    </SidebarLayout>
  )
}
