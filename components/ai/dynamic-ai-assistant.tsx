"use client"

import { useState, useEffect } from "react"
import { Brain, Sparkles, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface LocalAIProps {
  financialData: {
    stats: any
    vouchers: any[]
  }
}

interface DataContext {
  totalAmount: number
  totalVouchers: number
  cashAmount: number
  chequeAmount: number
  cashVouchers: number
  chequeVouchers: number
  avgAmount: number
  maxAmount: number
  minAmount: number
  vendors: string[]
  recentTransactions: any[]
  monthlyTrend: number
  cashPercentage: number
  chequePercentage: number
  largeTransactions: any[]
  smallTransactions: any[]
  frequentVendors: Array<{ name: string; count: number; total: number }>
  dateRange: { start: string; end: string }
}

export default function DynamicAIAssistant({ financialData }: LocalAIProps) {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState<DataContext | null>(null)

  useEffect(() => {
    buildDataContext()
  }, [financialData])

  const buildDataContext = () => {
    const { stats, vouchers } = financialData

    if (!vouchers || vouchers.length === 0) {
      setContext(null)
      return
    }

    const totalAmount = stats.totalCashAmount + stats.totalChequeAmount
    const totalVouchers = stats.totalCashVouchers + stats.totalChequeVouchers
    const amounts = vouchers.map((v: any) => v.amount).filter((a: number) => a > 0)

    // Vendor analysis
    const vendorMap = vouchers.reduce(
      (acc: Record<string, { count: number; total: number }>, v: any) => {
        if (!acc[v.paid_to]) {
          acc[v.paid_to] = { count: 0, total: 0 }
        }
        acc[v.paid_to].count++
        acc[v.paid_to].total += v.amount
        return acc
      },
      {} as Record<string, { count: number; total: number }>,
    )

    const frequentVendors = Object.entries(vendorMap)
      .map(([name, data]: [string, { count: number; total: number }]) => ({
        name,
        count: data.count,
        total: data.total,
      }))
      .sort((a, b) => b.count - a.count)

    // Date analysis
    const dates = vouchers.map((v: any) => new Date(v.date)).filter((d: Date) => !isNaN(d.getTime()))
    const sortedDates = dates.sort((a: Date, b: Date) => a.getTime() - b.getTime())

    // Create unique vendors array
    const uniqueVendors = vouchers.map((v: any) => v.paid_to)
    const vendorSet = new Set(uniqueVendors)
    const vendorsArray = Array.from(vendorSet)

    const avgAmount = amounts.length > 0 ? amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length : 0

    const dataContext: DataContext = {
      totalAmount,
      totalVouchers,
      cashAmount: stats.totalCashAmount,
      chequeAmount: stats.totalChequeAmount,
      cashVouchers: stats.totalCashVouchers,
      chequeVouchers: stats.totalChequeVouchers,
      avgAmount,
      maxAmount: amounts.length > 0 ? Math.max(...amounts) : 0,
      minAmount: amounts.length > 0 ? Math.min(...amounts) : 0,
      vendors: vendorsArray,
      recentTransactions: vouchers.slice(0, 5),
      monthlyTrend: calculateMonthlyTrend(vouchers),
      cashPercentage: totalAmount > 0 ? (stats.totalCashAmount / totalAmount) * 100 : 0,
      chequePercentage: totalAmount > 0 ? (stats.totalChequeAmount / totalAmount) * 100 : 0,
      largeTransactions: vouchers.filter((v: any) => v.amount > avgAmount * 1.5),
      smallTransactions: vouchers.filter((v: any) => v.amount < avgAmount * 0.5),
      frequentVendors,
      dateRange: {
        start: sortedDates.length > 0 ? sortedDates[0].toISOString().split("T")[0] : "",
        end: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1].toISOString().split("T")[0] : "",
      },
    }

    setContext(dataContext)
  }

  const calculateMonthlyTrend = (vouchers: any[]) => {
    if (vouchers.length < 2) return 0

    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const lastMonthTotal = vouchers
      .filter((v: any) => {
        const date = new Date(v.date)
        return date >= lastMonth && date < thisMonth
      })
      .reduce((sum: number, v: any) => sum + v.amount, 0)

    const thisMonthTotal = vouchers
      .filter((v: any) => {
        const date = new Date(v.date)
        return date >= thisMonth
      })
      .reduce((sum: number, v: any) => sum + v.amount, 0)

    return lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0
  }

  const analyzeQuery = (query: string, context: DataContext) => {
    const lowerQuery = query.toLowerCase()
    const words = lowerQuery.split(" ").filter((w: string) => w.length > 2)

    // Question type detection
    const isWhatQuestion = lowerQuery.includes("what") || lowerQuery.includes("which")
    const isHowQuestion = lowerQuery.includes("how")
    const isWhyQuestion = lowerQuery.includes("why")
    const isWhenQuestion = lowerQuery.includes("when")
    const isWhereQuestion = lowerQuery.includes("where")
    const isWhoQuestion = lowerQuery.includes("who")

    // Topic detection
    const topics = {
      total: ["total", "sum", "amount", "all"],
      average: ["average", "avg", "mean", "typical"],
      cash: ["cash", "money"],
      cheque: ["cheque", "check"],
      vendor: ["vendor", "payee", "paid", "supplier", "company"],
      trend: ["trend", "pattern", "growth", "increase", "decrease"],
      comparison: ["compare", "vs", "versus", "difference", "between"],
      time: ["recent", "latest", "last", "month", "year", "today"],
      large: ["large", "big", "high", "maximum", "max", "highest"],
      small: ["small", "low", "minimum", "min", "lowest"],
      count: ["count", "number", "how many", "quantity"],
    }

    const detectedTopics = Object.entries(topics)
      .filter(([_, keywords]: [string, string[]]) => keywords.some((keyword: string) => lowerQuery.includes(keyword)))
      .map(([topic, _]: [string, string[]]) => topic)

    return {
      isWhatQuestion,
      isHowQuestion,
      isWhyQuestion,
      isWhenQuestion,
      isWhereQuestion,
      isWhoQuestion,
      detectedTopics,
      words,
    }
  }

  const generateResponse = (query: string, context: DataContext) => {
    const analysis = analyzeQuery(query, context)
    const { detectedTopics } = analysis

    // Multi-topic responses
    if (detectedTopics.includes("total")) {
      if (detectedTopics.includes("cash")) {
        return `Your total cash transactions amount to ₱${context.cashAmount.toLocaleString()} across ${context.cashVouchers} vouchers. This represents ${context.cashPercentage.toFixed(1)}% of your total financial activity.`
      }
      if (detectedTopics.includes("cheque")) {
        return `Your total cheque transactions amount to ₱${context.chequeAmount.toLocaleString()} across ${context.chequeVouchers} vouchers. This represents ${context.chequePercentage.toFixed(1)}% of your total financial activity.`
      }
      return `Your total financial activity is ₱${context.totalAmount.toLocaleString()} across ${context.totalVouchers} transactions. Cash: ₱${context.cashAmount.toLocaleString()} (${context.cashPercentage.toFixed(1)}%), Cheque: ₱${context.chequeAmount.toLocaleString()} (${context.chequePercentage.toFixed(1)}%).`
    }

    if (detectedTopics.includes("average")) {
      if (detectedTopics.includes("cash")) {
        const avgCash = context.cashVouchers > 0 ? context.cashAmount / context.cashVouchers : 0
        return `Your average cash transaction is ₱${avgCash.toLocaleString()}. You have ${context.cashVouchers} cash transactions totaling ₱${context.cashAmount.toLocaleString()}.`
      }
      if (detectedTopics.includes("cheque")) {
        const avgCheque = context.chequeVouchers > 0 ? context.chequeAmount / context.chequeVouchers : 0
        return `Your average cheque transaction is ₱${avgCheque.toLocaleString()}. You have ${context.chequeVouchers} cheque transactions totaling ₱${context.chequeAmount.toLocaleString()}.`
      }
      return `Your average transaction amount is ₱${context.avgAmount.toLocaleString()}. This is calculated from ${context.totalVouchers} total transactions with amounts ranging from ₱${context.minAmount.toLocaleString()} to ₱${context.maxAmount.toLocaleString()}.`
    }

    if (detectedTopics.includes("vendor")) {
      if (detectedTopics.includes("count")) {
        return `You have transactions with ${context.vendors.length} different vendors. Your most frequent vendor is "${context.frequentVendors[0]?.name}" with ${context.frequentVendors[0]?.count} transactions totaling ₱${context.frequentVendors[0]?.total.toLocaleString()}.`
      }
      if (context.frequentVendors.length > 0) {
        const topVendors = context.frequentVendors.slice(0, 3)
        return `Your top vendors are: ${topVendors.map((v) => `"${v.name}" (${v.count} transactions, ₱${v.total.toLocaleString()})`).join(", ")}. You work with ${context.vendors.length} vendors in total.`
      }
    }

    if (detectedTopics.includes("large")) {
      if (context.largeTransactions.length > 0) {
        const largest = context.largeTransactions.reduce((max: any, current: any) =>
          current.amount > max.amount ? current : max,
        )
        return `You have ${context.largeTransactions.length} large transactions (above average). Your largest transaction is ₱${largest.amount.toLocaleString()} paid to "${largest.paid_to}" on ${new Date(largest.date).toLocaleDateString()}.`
      }
      return `Your largest transaction is ₱${context.maxAmount.toLocaleString()}. The average transaction size is ₱${context.avgAmount.toLocaleString()}.`
    }

    if (detectedTopics.includes("small")) {
      if (context.smallTransactions.length > 0) {
        const smallest = context.smallTransactions.reduce((min: any, current: any) =>
          current.amount < min.amount ? current : min,
        )
        return `You have ${context.smallTransactions.length} small transactions (below average). Your smallest transaction is ₱${smallest.amount.toLocaleString()} paid to "${smallest.paid_to}".`
      }
      return `Your smallest transaction is ₱${context.minAmount.toLocaleString()}. The average transaction size is ₱${context.avgAmount.toLocaleString()}.`
    }

    if (detectedTopics.includes("trend")) {
      const trendDirection =
        context.monthlyTrend > 0 ? "increasing" : context.monthlyTrend < 0 ? "decreasing" : "stable"
      return `Your spending trend is ${trendDirection} with a ${Math.abs(context.monthlyTrend).toFixed(1)}% change from last month. You prefer ${context.cashPercentage > context.chequePercentage ? "cash" : "cheque"} payments (${Math.max(context.cashPercentage, context.chequePercentage).toFixed(1)}% of transactions).`
    }

    if (detectedTopics.includes("comparison")) {
      return `Cash vs Cheque comparison: Cash represents ${context.cashPercentage.toFixed(1)}% (₱${context.cashAmount.toLocaleString()}) while cheques represent ${context.chequePercentage.toFixed(1)}% (₱${context.chequeAmount.toLocaleString()}) of your total ₱${context.totalAmount.toLocaleString()}.`
    }

    if (detectedTopics.includes("time") || detectedTopics.includes("recent")) {
      if (context.recentTransactions.length > 0) {
        const recentTotal = context.recentTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
        return `Your 5 most recent transactions total ₱${recentTotal.toLocaleString()}. Recent payees: ${context.recentTransactions.map((t: any) => `"${t.paid_to}" (₱${t.amount.toLocaleString()})`).join(", ")}.`
      }
    }

    if (detectedTopics.includes("count")) {
      return `Transaction count breakdown: ${context.totalVouchers} total transactions (${context.cashVouchers} cash, ${context.chequeVouchers} cheque). You've worked with ${context.vendors.length} different vendors over the period from ${context.dateRange.start} to ${context.dateRange.end}.`
    }

    // Specific vendor questions
    const mentionedVendor = context.vendors.find((vendor: string) => query.toLowerCase().includes(vendor.toLowerCase()))
    if (mentionedVendor) {
      const vendorData = context.frequentVendors.find((v) => v.name === mentionedVendor)
      if (vendorData) {
        return `Regarding "${mentionedVendor}": You have ${vendorData.count} transactions totaling ₱${vendorData.total.toLocaleString()}. Average per transaction: ₱${(vendorData.total / vendorData.count).toLocaleString()}.`
      }
    }

    // Fallback with context-aware response
    return `Based on your financial data: You have ₱${context.totalAmount.toLocaleString()} across ${context.totalVouchers} transactions with ${context.vendors.length} vendors. Your spending is ${context.cashPercentage > 60 ? "cash-heavy" : context.chequePercentage > 60 ? "cheque-focused" : "balanced"}. Try asking about totals, averages, vendors, trends, or specific amounts.`
  }

  const handleQuery = async () => {
    if (!query.trim() || !context) return

    setLoading(true)

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 800))

    try {
      const aiResponse = generateResponse(query, context)
      setResponse(aiResponse)
    } catch (error) {
      setResponse(
        "I'm having trouble analyzing that question. Could you try rephrasing it or asking about your totals, averages, vendors, or recent transactions?",
      )
    }

    setLoading(false)
  }

  if (!context) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Dynamic AI Assistant
            <Badge variant="secondary">No Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No financial data available for analysis.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Dynamic AI Assistant
          <Badge variant="default">Ready</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Chat Interface */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about your financial data... (e.g., 'Who is my biggest vendor?', 'Why is my spending increasing?')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleQuery()}
            />
            <Button onClick={handleQuery} disabled={loading || !query.trim()}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </Button>
          </div>

          {response && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-800">{response}</p>
              </div>
            </div>
          )}
        </div>

        {/* Data Context Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="font-semibold">₱{context.totalAmount.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Transactions</p>
            <p className="font-semibold">{context.totalVouchers}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Vendors</p>
            <p className="font-semibold">{context.vendors.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Avg Amount</p>
            <p className="font-semibold">₱{context.avgAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Sample Questions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">💡 Try asking:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              "What's my largest transaction?",
              "Who do I pay most often?",
              "How much do I spend on average?",
              "Which vendor costs me the most?",
              "What's my cash vs cheque ratio?",
              "Show me my spending trend",
            ].map((suggestion: string, index: number) => (
              <button
                key={index}
                onClick={() => setQuery(suggestion)}
                className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          🧠 Dynamic AI - Analyzes your actual data to answer any question
        </div>
      </CardContent>
    </Card>
  )
}
