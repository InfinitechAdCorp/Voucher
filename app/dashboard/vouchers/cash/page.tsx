"use client"

import { Suspense, lazy } from "react"
import SidebarLayout from "@/components/layout/sidebar-layout"
const CashVoucherPageContent = lazy(() => import("./cash-voucher-content"))
import ABICLoader from "@/components/abic-loader"

export default function CashVoucherPage() {
  return (
    <SidebarLayout title="Create Cash Voucher" description="Create and preview cash voucher with detailed particulars">
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <ABICLoader size="lg" text="Loading cash voucher form..." className="animate-fade-in" />
          </div>
        }
      >
        <CashVoucherPageContent />
      </Suspense>
    </SidebarLayout>
  )
}
