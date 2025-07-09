"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { setStoredUser, setAuthToken } from "@/lib/auth"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const data = await api.login(email, password)

      setAuthToken(data.token)
      setStoredUser(data.user)
      api.setToken(data.token)

      toast({
        title: "Login successful",
        description: "Welcome to ABIC Realty Accounting System",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-800 to-purple-600">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/20 to-pink-500/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/40 to-pink-400/40 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Floating Sparkles */}
        <div className="absolute top-1/4 left-1/4 animate-bounce delay-300">
          <Sparkles className="w-6 h-6 text-pink-300/60" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-bounce delay-700">
          <Sparkles className="w-4 h-4 text-purple-300/60" />
        </div>
        <div className="absolute bottom-1/3 left-1/5 animate-bounce delay-1000">
          <Sparkles className="w-5 h-5 text-pink-400/60" />
        </div>
      </div>

      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_35%,rgba(255,255,255,0.1)_50%,transparent_65%)] bg-[length:20px_20px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Glowing Card Container */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 animate-pulse" />

            <Card className="relative bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl overflow-hidden">
              {/* Header with Logo */}
<CardHeader className="relative bg-gradient-to-br from-purple-50 to-pink-50 pb-2 pt-4">

                <div className="flex flex-col items-center space-y-6">
                  {/* Logo with Glow */}
                  {/* Logo - Just the image, larger size */}
                  <div className="relative w-40 h-40">
                    <Image
                      src="/abiclogo-accounting.png"
                      alt="ABIC Realty Logo"
                      fill
                      className="object-contain"
                      sizes="160px"
                    />
                  </div>

                  
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-500 transition-colors" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-12 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-500 transition-colors" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-12 pr-12 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-purple-600 hover:text-pink-600 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 relative overflow-hidden group"
                    disabled={isLoading}
                  >
                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                    {isLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Sign In</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Additional Links */}
                
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
