"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Brain, Sparkles, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface LocalAIProps {
  financialData: {
    stats: any
    vouchers: any[]
  }
}

export default function TransformersAI({ financialData }: LocalAIProps) {
  const [pipeline, setPipeline] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState("")
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    loadModel()
  }, [])

  const loadModel = async () => {
    try {
      setLoading(true)

      // Dynamically import transformers.js
      const { pipeline: createPipeline } = await import("@xenova/transformers")

      // Load a lightweight text generation model
      const textGenerator = await createPipeline("text-generation", "Xenova/distilgpt2")

      setPipeline(textGenerator)
      setModelLoaded(true)

      // Generate initial insights
      await generateFinancialInsights(textGenerator)
    } catch (error) {
      console.error("Error loading AI model:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateFinancialInsights = async (model: any) => {
    const { stats, vouchers } = financialData

    const prompts = [
      `Financial summary: Total cash amount is ${stats.totalCashAmount} and cheque amount is ${stats.totalChequeAmount}. Analysis:`,
      `Transaction pattern shows ${vouchers.length} recent transactions. Key insight:`,
      `Cash flow indicates ${((stats.totalCashAmount / (stats.totalCashAmount + stats.totalChequeAmount || 1)) * 100).toFixed(1)}% cash usage. Recommendation:`,
    ]

    const generatedInsights = []

    for (const prompt of prompts) {
      try {
        const result = await model(prompt, {
          max_new_tokens: 30,
          temperature: 0.7,
          do_sample: true,
        })

        if (result && result[0] && result[0].generated_text) {
          const fullText = result[0].generated_text
          const insight = fullText.replace(prompt, "").trim()
          if (insight.length > 5) {
            generatedInsights.push(insight)
          }
        }
      } catch (error) {
        console.error("Error generating insight:", error)
      }
    }

    setInsights(generatedInsights)
  }

  const handleQuery = async () => {
    if (!pipeline || !query.trim()) return

    setLoading(true)
    try {
      // Create a simple prompt with financial context
      const prompt = `Financial data shows ${financialData.stats.totalCashAmount + financialData.stats.totalChequeAmount} total amount across ${financialData.vouchers.length} transactions. Question: ${query} Answer:`

      const result = await pipeline(prompt, {
        max_new_tokens: 50,
        temperature: 0.8,
        do_sample: true,
      })

      if (result && result[0] && result[0].generated_text) {
        const fullText = result[0].generated_text
        const answer = fullText.replace(prompt, "").trim()
        setResponse(answer || "I need more specific information to provide a detailed answer.")
      }
    } catch (error) {
      console.error("Error processing query:", error)
      setResponse("Sorry, I encountered an error processing your question.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Local AI Assistant
          <Badge variant={modelLoaded ? "default" : "secondary"}>{modelLoaded ? "Ready" : "Loading..."}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Chat Interface */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your financial data..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleQuery()}
              disabled={!modelLoaded}
            />
            <Button onClick={handleQuery} disabled={!modelLoaded || loading || !query.trim()}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </Button>
          </div>

          {response && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">{response}</p>
            </div>
          )}
        </div>

        {/* Generated Insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Generated Insights
            </h4>
            {insights.map((insight, index) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        )}

        {!modelLoaded && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading AI model... (first time may take a moment)</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
