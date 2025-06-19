"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, Receipt, LogOut, Menu, X, Home, PlusCircle, CreditCard, DollarSign, Users, Settings, ChevronDown } from 'lucide-react'
import Link from "next/link"
import { cn } from "@/lib/utils"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  isActive?: boolean
  children?: NavItem[]
}

interface SidebarLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export default function SidebarLayout({ children, title, description }: SidebarLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "accounting") {
      router.push("/")
      return
    }

    setUser(parsedUser)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  const isActivePath = (path: string) => {
    return pathname === path
  }

  const navigation: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      isActive: isActivePath("/dashboard"),
    },
    {
      title: "Accounts",
      href: "#",
      icon: <CreditCard className="h-5 w-5" />,
      children: [
        {
          title: "Create Account",
          href: "/dashboard/accounts/create",
          icon: <PlusCircle className="h-4 w-4" />,
          isActive: isActivePath("/dashboard/accounts/create"),
        },
        {
          title: "View Accounts",
          href: "/dashboard/accounts",
          icon: <FileText className="h-4 w-4" />,
          isActive: isActivePath("/dashboard/accounts"),
        },
      ],
    },
    {
      title: "Vouchers",
      href: "#",
      icon: <Receipt className="h-5 w-5" />,
      children: [
        {
          title: "Create Cash Voucher",
          href: "/dashboard/vouchers/cash",
          icon: <DollarSign className="h-4 w-4" />,
          isActive: isActivePath("/dashboard/vouchers/cash"),
        },
        {
          title: "Create Cheque Voucher",
          href: "/dashboard/vouchers/cheque",
          icon: <FileText className="h-4 w-4" />,
          isActive: isActivePath("/dashboard/vouchers/cheque"),
        },
      ],
    },
    {
      title: "Administration",
      href: "#",
      icon: <Settings className="h-5 w-5" />,
      children: [
        {
          title: "Cash Vouchers Admin",
          href: "/admin/cash",
          icon: <DollarSign className="h-4 w-4" />,
          isActive: isActivePath("/admin/cash"),
        },
        {
          title: "Cheque Vouchers Admin",
          href: "/admin/cheque",
          icon: <FileText className="h-4 w-4" />,
          isActive: isActivePath("/admin/cheque"),
        },
      ],
    },
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-40 w-full bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">ABIC Realty</h1>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-900">ABIC Realty</h1>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-1">
              {navigation.map((item) => (
                <div key={item.title}>
                  {item.children ? (
                    <>
                      <button
                        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                        onClick={() => toggleSection(item.title)}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-3">{item.title}</span>
                        </div>
                        <ChevronDown
                          className={cn("h-4 w-4 transition-transform", {
                            "transform rotate-180": activeSection === item.title,
                          })}
                        />
                      </button>
                      {activeSection === item.title && (
                        <div className="pl-8 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.title}
                              href={child.href}
                              className={cn(
                                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                                child.isActive
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-600 hover:bg-gray-100"
                              )}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {child.icon}
                              <span className="ml-3">{child.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                        item.isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" className="w-full justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 z-50 border-r border-gray-200 bg-white transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-gray-900">ABIC Realty</h1>
          ) : (
            <div className="w-full flex justify-center">
              <span className="text-xl font-bold">AR</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <>
                    <button
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md",
                        activeSection === item.title
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      onClick={() => toggleSection(item.title)}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        {sidebarOpen && <span className="ml-3">{item.title}</span>}
                      </div>
                      {sidebarOpen && (
                        <ChevronDown
                          className={cn("h-4 w-4 transition-transform", {
                            "transform rotate-180": activeSection === item.title,
                          })}
                        />
                      )}
                    </button>
                    {sidebarOpen && activeSection === item.title && (
                      <div className="pl-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.title}
                            href={child.href}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                              child.isActive
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-100"
                            )}
                          >
                            {child.icon}
                            <span className="ml-3">{child.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      item.isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {item.icon}
                    {sidebarOpen && <span className="ml-3">{item.title}</span>}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" className="w-full justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={handleLogout} variant="outline" size="icon" className="w-full">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={cn("flex-1 transition-all duration-300", sidebarOpen ? "lg:ml-64" : "lg:ml-20", "mt-16 lg:mt-0")}>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {description && <p className="text-gray-600">{description}</p>}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
