import { LoginForm } from "@/components/auth/login-form"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ABIC Realty</h1>
          <p className="text-gray-600 mt-2">Accounting Management System</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
