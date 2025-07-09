"use client"

import { useState } from "react"
import { Search, Zap, Target, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SmartSearchProps {
  vouchers: Array<{
    id: number
    paid_to: string
    amount: number
    date: string
    type: "cash" | "cheque"
    description?: string
  }>
}

export default function SmartSearch({ vouchers }: SmartSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const searchVouchers = async () => {
    if (!query.trim()) return

    setLoading(true)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500))

    const lowerQuery = query.toLowerCase()
    const searchResults: any[] = []

    // Smart search algorithm
    vouchers.forEach((voucher, index) => {
      let score = 0
      const searchableText = `${voucher.paid_to} ${voucher.description || ""} ${voucher.type}`.toLowerCase()

      // Exact match gets highest score
      if (searchableText.includes(lowerQuery)) {
        score += 100
      }

      // Word matching
      const queryWords = lowerQuery.split(' ').filter(word => word.length > 2)
      queryWords.forEach(word => {
        if (searchableText.includes(word)) {
          score += 50
        }
      })

      // Amount-based search
      if (lowerQuery.includes('high') || lowerQuery.includes('large') || lowerQuery.includes('big')) {
        const avgAmount = vouchers.reduce((sum, v) => sum + v.amount, 0) / vouchers.length
        if (voucher.amount > avgAmount * 1.5) {
          score += 30
        }
      }

      if (lowerQuery.includes('small') || lowerQuery.includes('low') || lowerQuery.includes('minor')) {
        const avgAmount = vouchers.reduce((sum, v) => sum + v.amount, 0) / vouchers.length
        if (voucher.amount < avgAmount * 0.5) {
          score += 30
        }
      }

      // Type-based search
      if (lowerQuery.includes('cash') && voucher.type === 'cash') {
        score += 40
      }
      if (lowerQuery.includes('cheque') && voucher.type === 'cheque') {
        score += 40
      }

      // Date-based search
      if (lowerQuery.includes('recent') || lowerQuery.includes('latest')) {
        const voucherDate = new Date(voucher.date)
        const daysDiff = (Date.now() - voucherDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysDiff < 30) {
          score += 25
        }
      }

      // Category-based intelligent search
      const categories = {
        'office': ['office', 'supplies', 'equipment', 'furniture', 'stationery'],
        'utilities': ['electric', 'water', 'internet', 'phone', 'utility'],
        'maintenance': ['repair', 'maintenance', 'service', 'fix'],
        'travel': ['travel', 'transport', 'fuel', 'gas', 'taxi'],
        'professional': ['legal', 'accounting', 'consultant', 'professional']
      }

      Object.entries(categories).forEach(([category, keywords]) => {
        if (lowerQuery.includes(category)) {
          keywords.forEach(keyword => {
            if (searchableText.includes(keyword)) {
              score += 35
            }
          })
        }
      })

      if (score > 0) {
        searchResults.push({
          voucher,
          score,
          matchReason: getMatchReason(voucher, lowerQuery, score)
        })
      }
    })

    // Sort by score and limit results
    const sortedResults = searchResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)

    setResults(sortedResults)
    setLoading(false)
  }

  const getMatchReason = (voucher: any, query: string, score: number) => {
    const reasons = []
    
    if (voucher.paid_to.toLowerCase().includes(query)) {
      reasons.push("Payee name match")
    }
    if (voucher.description?.toLowerCase().includes(query)) {
      reasons.push("Description match")
    }
    if (query.includes(voucher.type)) {
      reasons.push("Payment type match")
    }
    if (score > 80) {
      reasons.push("High relevance")
    }

    return reasons.length > 0 ? reasons.join(", ") : "Semantic match"
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Smart Search
          <Badge variant="default">Ready</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Smart search... (e.g., 'office supplies', 'high amount cash', 'recent payments')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchVouchers()}
          />
          <Button onClick={searchVouchers} disabled={loading || !query.trim()}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Smart Results ({results.length})
            </h4>
            {results.map((result, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{result.voucher.paid_to}</p>
                    <p className="text-sm text-gray-600">{result.voucher.description || "No description"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{result.voucher.type}</Badge>
                      <span className="text-xs text-gray-500">Score: {result.score}</span>
                      <span className="text-xs text-blue-600">{result.matchReason}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium">{formatAmount(result.voucher.amount)}</p>
                    <p className="text-xs text-gray-500">{result.voucher.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {query && results.length === 0 && !loading && (
          <div className="text-center py-4 text-gray-500">
            <Filter className="mx-auto h-8 w-8 mb-2" />
            <p>No matches found. Try different keywords.</p>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          💡 Smart search understands context and categories
        </div>
      </CardContent>
    </Card>
  )
}
