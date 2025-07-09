import { Suspense, lazy } from "react"
import SidebarLayout from "@/components/layout/sidebar-layout"
const AdminChequeVouchersPage = lazy(() => import("@/components/admin/admin-cheque-vouchers-page"))
import ABICLoader from "@/components/abic-loader"

export default function Page() {
  return (
    <SidebarLayout title="Cheque Vouchers Administration" description="Manage all cheque vouchers">
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <ABICLoader size="lg" text="Loading cheque vouchers administration..." className="animate-fade-in" />
          </div>
        }
      >
        <AdminChequeVouchersPage />
      </Suspense>
    </SidebarLayout>
  )
}
