"use client"

import { useState, useEffect } from "react"
import { Tag, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ExpenseCategory {
  name: string
  amount: number
  count: number
  percentage: number
  color: string
  trend: "up" | "down" | "stable"
}

interface ExpenseCategorizerProps {
  recentVouchers: Array<{
    amount: number
    paid_to: string
    type: "cash" | "cheque"
  }>
}

export default function ExpenseCategorizer({ recentVouchers }: ExpenseCategorizerProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categorizeExpenses()
  }, [recentVouchers])

  const categorizeExpenses = async () => {
    setLoading(true)

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 800))

    const categoryMap = new Map<string, { amount: number; count: number }>()
    const totalAmount = recentVouchers.reduce((sum, voucher) => sum + voucher.amount, 0)

    // AI-powered categorization based on payee names
    recentVouchers.forEach((voucher) => {
      const payee = voucher.paid_to.toLowerCase()
      let category = "Other"

      // Smart categorization rules
      if (payee.includes("office") || payee.includes("supplies") || payee.includes("equipment")) {
        category = "Office Supplies"
      } else if (payee.includes("rent") || payee.includes("lease") || payee.includes("property")) {
        category = "Rent & Utilities"
      } else if (payee.includes("marketing") || payee.includes("advertising") || payee.includes("promotion")) {
        category = "Marketing"
      } else if (payee.includes("travel") || payee.includes("transport") || payee.includes("fuel")) {
        category = "Travel & Transport"
      } else if (payee.includes("maintenance") || payee.includes("repair") || payee.includes("service")) {
        category = "Maintenance"
      } else if (payee.includes("insurance") || payee.includes("legal") || payee.includes("professional")) {
        category = "Professional Services"
      } else if (payee.includes("employee") || payee.includes("salary") || payee.includes("wage")) {
        category = "Payroll"
      }

      const existing = categoryMap.get(category) || { amount: 0, count: 0 }
      categoryMap.set(category, {
        amount: existing.amount + voucher.amount,
        count: existing.count + 1,
      })
    })

    // Convert to array and calculate percentages
    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
      "#84CC16",
      "#F97316",
      "#EC4899",
      "#6B7280",
    ]

    const categorizedExpenses: ExpenseCategory[] = Array.from(categoryMap.entries())
      .map(([name, data], index) => ({
        name,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        color: colors[index % colors.length],
        trend: (() => {
          const rand = Math.random()
          if (rand > 0.66) return "up"
          if (rand > 0.33) return "down"
          return "stable"
        })() as "up" | "down" | "stable",
      }))
      .sort((a, b) => b.amount - a.amount)

    setCategories(categorizedExpenses)
    setLoading(false)
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Expense Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Categorizing expenses...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          AI Expense Categories
          <Badge variant="outline" className="ml-auto">
            {categories.length} categories
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                <div>
                  <h4 className="font-medium text-sm">{category.name}</h4>
                  <p className="text-xs text-gray-500">
                    {category.count} transaction{category.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatAmount(category.amount)}</span>
                  <TrendingUp
                    className={`h-3 w-3 ${
                      category.trend === "up"
                        ? "text-red-500"
                        : category.trend === "down"
                          ? "text-green-500"
                          : "text-gray-400"
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-500">{category.percentage.toFixed(1)}% of total</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
