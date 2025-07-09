"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FinancialInsight {
  type: "trend" | "anomaly" | "recommendation" | "prediction"
  title: string
  description: string
  severity: "low" | "medium" | "high"
  value?: number
  change?: number
  icon: React.ReactNode
}

interface AIInsightsProps {
  stats: {
    totalCashAmount: number
    totalChequeAmount: number
    totalCashVouchers: number
    totalChequeVouchers: number
  }
  recentVouchers: Array<{
    amount: number
    date: string
    type: "cash" | "cheque"
    paid_to: string
  }>
}

export default function AIInsights({ stats, recentVouchers }: AIInsightsProps) {
  const [insights, setInsights] = useState<FinancialInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateInsights()
  }, [stats, recentVouchers])

  const generateInsights = async () => {
    setLoading(true)

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const generatedInsights: FinancialInsight[] = []

    // Cash vs Cheque Analysis
    const totalAmount = stats.totalCashAmount + stats.totalChequeAmount
    const cashPercentage = totalAmount > 0 ? (stats.totalCashAmount / totalAmount) * 100 : 0

    if (cashPercentage > 70) {
      generatedInsights.push({
        type: "recommendation",
        title: "High Cash Usage Detected",
        description: `${cashPercentage.toFixed(1)}% of transactions are cash-based. Consider digital payment methods for better tracking.`,
        severity: "medium",
        value: cashPercentage,
        icon: <AlertTriangle className="h-4 w-4" />,
      })
    }

    // Recent spending pattern analysis
    if (recentVouchers.length > 0) {
      const recentAmounts = recentVouchers.map((v) => v.amount)
      const avgAmount = recentAmounts.reduce((a, b) => a + b, 0) / recentAmounts.length
      const maxAmount = Math.max(...recentAmounts)

      if (maxAmount > avgAmount * 3) {
        generatedInsights.push({
          type: "anomaly",
          title: "Unusual Large Transaction",
          description: `A recent transaction of ₱${maxAmount.toLocaleString()} is significantly higher than average (₱${avgAmount.toLocaleString()}).`,
          severity: "high",
          value: maxAmount,
          icon: <TrendingUp className="h-4 w-4" />,
        })
      }
    }

    // Voucher frequency analysis
    const totalVouchers = stats.totalCashVouchers + stats.totalChequeVouchers
    if (totalVouchers > 0) {
      const avgPerType = totalVouchers / 2
      if (stats.totalCashVouchers > avgPerType * 1.5) {
        generatedInsights.push({
          type: "trend",
          title: "Cash Voucher Preference",
          description: `You're creating ${((stats.totalCashVouchers / totalVouchers) * 100).toFixed(1)}% more cash vouchers than cheque vouchers.`,
          severity: "low",
          change: stats.totalCashVouchers - stats.totalChequeVouchers,
          icon: <BarChart3 className="h-4 w-4" />,
        })
      }
    }

    // Smart recommendations
    generatedInsights.push({
      type: "recommendation",
      title: "Optimize Your Workflow",
      description: "Based on your usage patterns, consider setting up recurring vouchers for regular payments to save time.",
      severity: "low",
      icon: <Lightbulb className="h-4 w-4" />,
    })

    setInsights(generatedInsights)
    setLoading(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Analyzing your data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Insights
          <Badge variant="outline" className="ml-auto">
            {insights.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{insight.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {insight.type}
                    </Badge>
                  </div>
                  <p className="text-sm opacity-90">{insight.description}</p>
                  {insight.value && (
                    <div className="mt-2 text-xs font-mono">
                      Value:{" "}
                      {typeof insight.value === "number" && insight.value > 1000
                        ? `₱${insight.value.toLocaleString()}`
                        : `${insight.value.toFixed(1)}${insight.type === "trend" ? "%" : ""}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
