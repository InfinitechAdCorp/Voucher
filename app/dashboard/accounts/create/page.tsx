"use client"

import { Suspense } from "react"
import SidebarLayout from "@/components/layout/sidebar-layout"
import CreateAccountContent from "./create-account-content"

export default function CreateAccountPage() {
  return (
    <SidebarLayout title="Create Account" description="Add a new accounting account to the system">
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading account form...</p>
            </div>
          </div>
        }
      >
        <CreateAccountContent />
      </Suspense>
    </SidebarLayout>
  )
}
