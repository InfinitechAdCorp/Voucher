"use client"

import { Suspense, lazy } from "react"
import SidebarLayout from "@/components/layout/sidebar-layout"
const ChequeVoucherPageContent = lazy(() => import("./cheque-voucher-content"))
import ABICLoader from "@/components/abic-loader"

export default function ChequeVoucherPage() {
  return (
    <SidebarLayout
      title="Create Cheque Voucher"
      description="Fill in the cheque voucher information and generate your voucher"
    >
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <ABICLoader size="lg" text="Loading cheque voucher form..." className="animate-fade-in" />
          </div>
        }
      >
        <ChequeVoucherPageContent />
      </Suspense>
    </SidebarLayout>
  )
}
