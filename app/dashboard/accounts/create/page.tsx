"use client"

import { Suspense, lazy } from "react"
import SidebarLayout from "@/components/layout/sidebar-layout"
const CreateAccountContent = lazy(() => import("./create-account-content"))
import ABICLoader from "@/components/abic-loader"

export default function CreateAccountPage() {
  return (
    <SidebarLayout title="Create Account" description="Add a new accounting account to the system">
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <ABICLoader size="lg" text="Loading account form..." className="animate-fade-in" />
          </div>
        }
      >
        <CreateAccountContent />
      </Suspense>
    </SidebarLayout>
  )
}
