import SidebarLayout from "@/components/layout/sidebar-layout";
import AdminCashVouchersPage from "@/components/admin/admin-cash-vouchers-page";

export default function Page() {
  return (
    <SidebarLayout
      title="Cash Vouchers Administration"
      description="Manage all cash vouchers"
    >
      <AdminCashVouchersPage />
    </SidebarLayout>
  );
}
