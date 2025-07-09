"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PatternAnalyzerProps {
  vouchers: Array<{
    id: number
    paid_to: string
    amount: number
    date: string
    type: "cash" | "cheque"
  }>
  stats: any
}

interface AIInsight {
  type: "pattern" | "anomaly" | "prediction" | "recommendation"
  title: string
  description: string
  confidence: number
  data?: any
}

export default function PatternAnalyzer({ vouchers, stats }: PatternAnalyzerProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (vouchers.length > 0) {
      analyzePatterns()
    }
  }, [vouchers, stats])

  const analyzePatterns = async () => {
    setAnalyzing(true)

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const generatedInsights: AIInsight[] = []

    // 1. Spending Pattern Analysis
    const spendingByDay = analyzeSpendingByDay()
    if (spendingByDay.insight) {
      generatedInsights.push(spendingByDay.insight)
    }

    // 2. Vendor Analysis
    const vendorAnalysis = analyzeVendorPatterns()
    generatedInsights.push(...vendorAnalysis)

    // 3. Amount Pattern Analysis
    const amountPatterns = analyzeAmountPatterns()
    generatedInsights.push(...amountPatterns)

    // 4. Cash vs Cheque Analysis
    const paymentAnalysis = analyzePaymentMethods()
    if (paymentAnalysis) {
      generatedInsights.push(paymentAnalysis)
    }

    // 5. Anomaly Detection
    const anomalies = detectAnomalies()
    generatedInsights.push(...anomalies)

    // 6. Predictive Insights
    const predictions = generatePredictions()
    generatedInsights.push(...predictions)

    setInsights(generatedInsights)
    setAnalyzing(false)
  }

  const analyzeSpendingByDay = () => {
    const daySpending = vouchers.reduce(
      (acc, voucher) => {
        const day = new Date(voucher.date).getDay()
        acc[day] = (acc[day] || 0) + voucher.amount
        return acc
      },
      {} as Record<number, number>,
    )

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const maxDay = Object.entries(daySpending).reduce(
      (max, [day, amount]) => (amount > (daySpending[max] || 0) ? Number.parseInt(day) : max),
      0,
    )

    return {
      insight: {
        type: "pattern" as const,
        title: "Peak Spending Day Identified",
        description: `Your highest spending occurs on ${days[maxDay]}s with an average of ₱${(daySpending[maxDay] || 0).toLocaleString()}. Consider budget planning around this pattern.`,
        confidence: 0.85,
        data: { day: days[maxDay], amount: daySpending[maxDay] },
      },
    }
  }

  const analyzeVendorPatterns = (): AIInsight[] => {
    const vendorFrequency = vouchers.reduce(
      (acc, voucher) => {
        acc[voucher.paid_to] = (acc[voucher.paid_to] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const vendorAmounts = vouchers.reduce(
      (acc, voucher) => {
        acc[voucher.paid_to] = (acc[voucher.paid_to] || 0) + voucher.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const insights: AIInsight[] = []

    // Most frequent vendor
    const mostFrequent = Object.entries(vendorFrequency).reduce(
      (max, [vendor, count]) => (count > vendorFrequency[max[0]] ? [vendor, count] : max),
      ["", 0],
    )

    if (mostFrequent[1] > 2) {
      insights.push({
        type: "pattern",
        title: "Frequent Vendor Detected",
        description: `You have ${mostFrequent[1]} transactions with "${mostFrequent[0]}". Consider negotiating bulk discounts or setting up automated payments.`,
        confidence: 0.9,
        data: { vendor: mostFrequent[0], count: mostFrequent[1] },
      })
    }

    // High-value vendor
    const highestValue = Object.entries(vendorAmounts).reduce(
      (max, [vendor, amount]) => (amount > vendorAmounts[max[0]] ? [vendor, amount] : max),
      ["", 0],
    )

    if (highestValue[1] > (stats.totalCashAmount + stats.totalChequeAmount) * 0.2) {
      insights.push({
        type: "recommendation",
        title: "Major Vendor Identified",
        description: `"${highestValue[0]}" represents ${((highestValue[1] / (stats.totalCashAmount + stats.totalChequeAmount)) * 100).toFixed(1)}% of your total spending. Monitor this relationship closely.`,
        confidence: 0.95,
        data: { vendor: highestValue[0], amount: highestValue[1] },
      })
    }

    return insights
  }

  const analyzeAmountPatterns = (): AIInsight[] => {
    const amounts = vouchers.map((v) => v.amount).sort((a, b) => a - b)
    const insights: AIInsight[] = []

    // Round number analysis
    const roundAmounts = amounts.filter((amount) => amount % 100 === 0 || amount % 50 === 0)
    if (roundAmounts.length > amounts.length * 0.6) {
      insights.push({
        type: "pattern",
        title: "Round Number Preference",
        description: `${((roundAmounts.length / amounts.length) * 100).toFixed(1)}% of your transactions are round numbers. This suggests estimated rather than exact amounts.`,
        confidence: 0.8,
      })
    }

    // Amount clustering
    const median = amounts[Math.floor(amounts.length / 2)]
    const smallTransactions = amounts.filter((a) => a < median * 0.5).length
    const largeTransactions = amounts.filter((a) => a > median * 2).length

    if (smallTransactions > amounts.length * 0.3) {
      insights.push({
        type: "recommendation",
        title: "Many Small Transactions",
        description: `${smallTransactions} transactions are significantly below average. Consider consolidating small purchases to reduce processing overhead.`,
        confidence: 0.75,
      })
    }

    return insights
  }

  const analyzePaymentMethods = (): AIInsight | null => {
    const cashCount = vouchers.filter((v) => v.type === "cash").length
    const chequeCount = vouchers.filter((v) => v.type === "cheque").length
    const total = cashCount + chequeCount

    if (total === 0) return null

    const cashPercentage = (cashCount / total) * 100

    if (cashPercentage > 80) {
      return {
        type: "recommendation",
        title: "High Cash Usage",
        description: `${cashPercentage.toFixed(1)}% of transactions are cash-based. Consider digital payments for better tracking and security.`,
        confidence: 0.9,
      }
    } else if (cashPercentage < 20) {
      return {
        type: "pattern",
        title: "Digital Payment Preference",
        description: `Strong preference for cheque payments (${(100 - cashPercentage).toFixed(1)}%). This indicates good financial documentation practices.`,
        confidence: 0.85,
      }
    }

    return null
  }

  const detectAnomalies = (): AIInsight[] => {
    const amounts = vouchers.map((v) => v.amount)
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
    const stdDev = Math.sqrt(amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length)

    const anomalies: AIInsight[] = []
    const threshold = mean + 2 * stdDev

    const unusualTransactions = vouchers.filter((v) => v.amount > threshold)

    if (unusualTransactions.length > 0) {
      anomalies.push({
        type: "anomaly",
        title: "Unusual Transaction Amounts",
        description: `${unusualTransactions.length} transaction(s) are significantly above average. Largest: ₱${Math.max(...unusualTransactions.map((t) => t.amount)).toLocaleString()} to "${unusualTransactions.find((t) => t.amount === Math.max(...unusualTransactions.map((t) => t.amount)))?.paid_to}".`,
        confidence: 0.8,
        data: { count: unusualTransactions.length, transactions: unusualTransactions },
      })
    }

    return anomalies
  }

  const generatePredictions = (): AIInsight[] => {
    const predictions: AIInsight[] = []

    // Monthly spending prediction
    const totalAmount = stats.totalCashAmount + stats.totalChequeAmount
    const avgPerTransaction = totalAmount / vouchers.length

    predictions.push({
      type: "prediction",
      title: "Spending Forecast",
      description: `Based on current patterns, estimated monthly spending: ₱${(avgPerTransaction * vouchers.length * 1.1).toLocaleString()}. This includes a 10% growth factor.`,
      confidence: 0.7,
      data: { predicted: avgPerTransaction * vouchers.length * 1.1 },
    })

    // Cash flow prediction
    const recentTrend = vouchers.slice(-5).reduce((sum, v) => sum + v.amount, 0) / 5
    const overallAvg = totalAmount / vouchers.length

    if (recentTrend > overallAvg * 1.2) {
      predictions.push({
        type: "prediction",
        title: "Increasing Spend Trend",
        description: `Recent transactions average ₱${recentTrend.toLocaleString()}, which is ${((recentTrend / overallAvg - 1) * 100).toFixed(1)}% above your overall average. Monitor budget closely.`,
        confidence: 0.75,
      })
    }

    return predictions
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pattern":
        return <BarChart3 className="h-4 w-4" />
      case "anomaly":
        return <AlertTriangle className="h-4 w-4" />
      case "prediction":
        return <TrendingUp className="h-4 w-4" />
      case "recommendation":
        return <Lightbulb className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "pattern":
        return "bg-blue-100 text-blue-800"
      case "anomaly":
        return "bg-red-100 text-red-800"
      case "prediction":
        return "bg-purple-100 text-purple-800"
      case "recommendation":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          AI Pattern Analyzer
          <Badge variant="outline" className="ml-auto">
            {insights.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
            <span className="text-gray-600">Analyzing patterns with AI...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <Button onClick={analyzePatterns} className="w-full">
              Re-analyze Patterns
            </Button>

            {insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge className={`text-xs ${getInsightColor(insight.type)}`}>{insight.type}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
