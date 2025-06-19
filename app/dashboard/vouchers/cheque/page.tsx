import { Suspense } from "react";
import SidebarLayout from "@/components/layout/sidebar-layout";
import ChequeVoucherPageContent from "./cheque-voucher-content";

export default function ChequeVoucherPage() {
  return (
    <SidebarLayout 
      title="Create Cheque Voucher" 
      description="Fill in the cheque voucher information and generate your voucher"
    >
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cheque voucher...</p>
          </div>
        </div>
      }>
        <ChequeVoucherPageContent />
      </Suspense>
    </SidebarLayout>
  );
}
