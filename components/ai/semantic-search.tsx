"use client"

import { useState, useEffect } from "react"
import { Search, Zap, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SemanticSearchProps {
  vouchers: Array<{
    id: number
    paid_to: string
    amount: number
    date: string
    type: "cash" | "cheque"
    description?: string
  }>
}

export default function SemanticSearch({ vouchers }: SemanticSearchProps) {
  const [embeddingPipeline, setEmbeddingPipeline] = useState<any>(null)
  const [voucherEmbeddings, setVoucherEmbeddings] = useState<number[][]>([])
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modelReady, setModelReady] = useState(false)

  useEffect(() => {
    loadEmbeddingModel()
  }, [])

  useEffect(() => {
    if (embeddingPipeline && vouchers.length > 0) {
      generateVoucherEmbeddings()
    }
  }, [embeddingPipeline, vouchers])

  const loadEmbeddingModel = async () => {
    try {
      setLoading(true)

      // Load sentence embeddings model
      const { pipeline } = await import("@xenova/transformers")
      const pipeline_instance = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")

      setEmbeddingPipeline(pipeline_instance)
      setModelReady(true)
    } catch (error) {
      console.error("Error loading embedding model:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateVoucherEmbeddings = async () => {
    if (!embeddingPipeline) return

    const voucherTexts = vouchers.map(
      (voucher) => `${voucher.paid_to} ${voucher.description || ""} ${voucher.type} payment ${voucher.amount}`,
    )

    const embeddingResults: number[][] = []
    for (const text of voucherTexts) {
      try {
        const result = await embeddingPipeline(text, { pooling: "mean", normalize: true })
        // Properly convert the tensor data to number array
        const embedding: number[] = Array.from(result.data as Float32Array)
        embeddingResults.push(embedding)
      } catch (error) {
        console.error("Error generating embedding:", error)
        embeddingResults.push([]) // Empty array as fallback
      }
    }

    setVoucherEmbeddings(embeddingResults)
  }

  const cosineSimilarity = (a: number[], b: number[]) => {
    if (a.length !== b.length || a.length === 0) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB)
    return denominator === 0 ? 0 : dotProduct / denominator
  }

  const searchVouchers = async () => {
    if (!embeddingPipeline || !query.trim() || voucherEmbeddings.length === 0) return

    setLoading(true)
    try {
      // Generate embedding for query
      const queryResult = await embeddingPipeline(query, { pooling: "mean", normalize: true })
      const queryEmbedding: number[] = Array.from(queryResult.data as Float32Array)

      // Calculate similarities
      const similarities = voucherEmbeddings.map((voucherEmb, index) => ({
        voucher: vouchers[index],
        similarity: voucherEmb.length > 0 ? cosineSimilarity(queryEmbedding, voucherEmb) : 0,
        index,
      }))

      // Sort by similarity and filter relevant results
      const sortedResults = similarities
        .filter((result) => result.similarity > 0.2) // Lower threshold for more results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5)

      setResults(sortedResults)
    } catch (error) {
      console.error("Error searching:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
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
          AI Semantic Search
          <Badge variant={modelReady ? "default" : "secondary"}>{modelReady ? "Ready" : "Loading..."}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by meaning... (e.g., 'office equipment', 'monthly bills')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchVouchers()}
            disabled={!modelReady}
          />
          <Button onClick={searchVouchers} disabled={!modelReady || loading || !query.trim()}>
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
              Semantic Matches ({results.length})
            </h4>
            {results.map((result, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{result.voucher.paid_to}</p>
                    <p className="text-sm text-gray-600">{result.voucher.description || "No description"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{result.voucher.type}</Badge>
                      <span className="text-xs text-gray-500">Match: {(result.similarity * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatAmount(result.voucher.amount)}</p>
                    <p className="text-xs text-gray-500">{result.voucher.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {query && results.length === 0 && !loading && modelReady && (
          <div className="text-center py-4 text-gray-500">
            <p>No semantic matches found. Try different keywords.</p>
          </div>
        )}

        {!modelReady && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading semantic search model...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
