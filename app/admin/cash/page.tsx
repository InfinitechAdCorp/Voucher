import { Suspense, lazy } from "react"
import SidebarLayout from "@/components/layout/sidebar-layout"
const AdminCashVouchersPage = lazy(() => import("@/components/admin/admin-cash-vouchers-page"))
import ABICLoader from "@/components/abic-loader"

export default function Page() {
  return (
    <SidebarLayout
      title="Cash Vouchers Administration"
      description="Manage all cash vouchers"
    >
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <ABICLoader size="lg" text="Loading cash vouchers administration..." className="animate-fade-in" />
          </div>
        }
      >
        <AdminCashVouchersPage />
      </Suspense>
    </SidebarLayout>
  )
}
