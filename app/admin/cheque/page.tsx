import SidebarLayout from "@/components/layout/sidebar-layout"
import AdminChequeVouchersPage from "@/components/admin/admin-cheque-vouchers-page"

export default function Page() {
  return (
    <SidebarLayout title="Cheque Vouchers Administration" description="Manage all cheque vouchers">
      <AdminChequeVouchersPage />
    </SidebarLayout>
  )
}
