import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ABIC Realty</h1>
          <p className="text-gray-600 mt-2">Create Your Account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
