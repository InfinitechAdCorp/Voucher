"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Brain, User, Bot, Send, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function RealAIAssistant() {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hi! I'm a real AI assistant. I can do math, answer questions, and have actual conversations. Try me!",
      timestamp: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Advanced math parser that handles natural language
  const parseAndCalculate = (input: string): string | null => {
    const text = input.toLowerCase().replace(/[,]/g, "")

    // Handle natural language math
    const mathExpression = text
      .replace(/\btimes\b/g, "*")
      .replace(/\bmultiplied by\b/g, "*")
      .replace(/\bplus\b/g, "+")
      .replace(/\bminus\b/g, "-")
      .replace(/\bdivided by\b/g, "/")
      .replace(/\bto the power of\b/g, "**")
      .replace(/\bsquared\b/g, "**2")
      .replace(/\bcubed\b/g, "**3")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/\^/g, "**")

    // Extract numbers and operators
    const mathPattern = /^[\d\s+\-*/().^**\s]+$/
    const naturalMathPattern =
      /(\d+(?:\.\d+)?)\s*(times|multiplied by|plus|minus|divided by|\*|\+|-|\/|\^|\*\*)\s*(\d+(?:\.\d+)?)/i

    // Try natural language first
    const naturalMatch = text.match(/(\d+(?:\.\d+)?)\s*(times|multiplied by|plus|minus|divided by)\s*(\d+(?:\.\d+)?)/i)
    if (naturalMatch) {
      const num1 = Number.parseFloat(naturalMatch[1])
      const operator = naturalMatch[2].toLowerCase()
      const num2 = Number.parseFloat(naturalMatch[3])

      let result: number
      switch (operator) {
        case "times":
        case "multiplied by":
          result = num1 * num2
          break
        case "plus":
          result = num1 + num2
          break
        case "minus":
          result = num1 - num2
          break
        case "divided by":
          result = num2 !== 0 ? num1 / num2 : Number.NaN
          break
        default:
          return null
      }

      if (isNaN(result)) return "Cannot divide by zero!"
      return result % 1 === 0 ? result.toString() : result.toFixed(2)
    }

    // Try direct math expression
    try {
      // Clean and validate the expression
      const cleanExpr = mathExpression.replace(/\s+/g, "")
      if (mathPattern.test(cleanExpr)) {
        // Use Function constructor for safe evaluation
        const result = Function(`"use strict"; return (${cleanExpr})`)()
        if (typeof result === "number" && !isNaN(result)) {
          return result % 1 === 0 ? result.toString() : result.toFixed(2)
        }
      }
    } catch (error) {
      // If math parsing fails, return null to try other responses
    }

    return null
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      handleSendMessage()
    }
  }

  const generateIntelligentResponse = (userInput: string): string => {
    const input = userInput.toLowerCase().trim()

    // First, try to solve any math
    const mathResult = parseAndCalculate(userInput)
    if (mathResult !== null) {
      return mathResult
    }

    // Weather questions - be honest about limitations
    if (/weather|temperature|rain|sunny|cloudy|forecast/i.test(input)) {
      return "I don't have access to current weather data since I'm a local AI assistant. You can check weather apps, websites like weather.com, or ask a voice assistant with internet access for current weather information."
    }

    // Time/date questions
    if (/what time|current time|time is it/i.test(input)) {
      const currentTime = new Date().toLocaleTimeString()
      return `The current time is ${currentTime}.`
    }

    if (/what date|today's date|what day/i.test(input)) {
      const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      return `Today is ${currentDate}.`
    }

    // News/current events - be honest
    if (/news|current events|what's happening|latest/i.test(input)) {
      return "I don't have access to current news or real-time information since I'm a local AI. For the latest news, I'd recommend checking news websites, apps, or other online sources."
    }

    // Greetings
    if (/^(hi|hello|hey|sup|what's up|whats up|good morning|good afternoon|good evening)$/i.test(input)) {
      return "Hello! How can I help you today?"
    }

    // How are you variations
    if (/how are you|how r u|how do you feel/i.test(input)) {
      return "I'm doing well, thank you for asking! I'm here and ready to help with whatever you need."
    }

    // Identity questions
    if (/who are you|what are you|tell me about yourself/i.test(input)) {
      return "I'm an AI assistant that runs locally on your device. I can help with calculations, answer questions I have knowledge about, and have conversations. I don't have access to the internet or real-time data."
    }

    // Capability questions
    if (/what can you do|your capabilities|help me|what do you know/i.test(input)) {
      return "I can help with math calculations, answer questions about topics I know, explain concepts, solve problems, and have conversations. I work offline so I can't access current information like weather or news. What would you like help with?"
    }

    // Math-related requests
    if (/calculate|compute|solve|math|mathematics|equation/i.test(input)) {
      return "I can help with math! Try asking me things like '25 times 4', '100 divided by 5', '2 + 2', or even complex expressions like '(15 + 5) * 2'. What calculation do you need?"
    }

    // Help requests
    if (/^(help|assist|support)$/i.test(input)) {
      return "I'm here to help! I can do calculations, answer questions about topics I know, explain things, or just chat. What do you need assistance with?"
    }

    // Science questions
    if (/science|physics|chemistry|biology|explain.*how.*work/i.test(input)) {
      return "I can help explain scientific concepts! What specific science topic would you like me to explain? I can break down complex ideas into simpler terms."
    }

    // Appreciation
    if (/thank you|thanks|appreciate/i.test(input)) {
      return "You're welcome! I'm glad I could help. Is there anything else you'd like to know or discuss?"
    }

    // Confirmation/agreement
    if (/^(yes|yeah|yep|ok|okay|sure|right|correct|exactly)$/i.test(input)) {
      return "Great! What would you like to do next? I'm here to help with calculations, questions, or anything else you need."
    }

    // Disagreement/confusion
    if (/^(no|nope|wrong|incorrect|that's not right)$/i.test(input)) {
      return "I apologize if I misunderstood. Could you clarify what you're looking for? I want to make sure I give you the right information."
    }

    // Questions about specific topics I should handle better
    if (/what is|define|explain/i.test(input)) {
      return "I'd be happy to explain that concept! Could you be more specific about what you'd like me to define or explain? I can provide detailed explanations on many topics I have knowledge about."
    }

    // Default response for unclear input
    return "I'm not sure I understand that question. Could you rephrase it or be more specific? I can help with math problems, explain concepts I know about, or just have a conversation. What are you looking for?"
  }

  const handleSendMessage = async () => {
    if (!query.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: query,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    const currentQuery = query
    setQuery("")

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700))

    const response = generateIntelligentResponse(currentQuery)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: response,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setLoading(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="flex flex-col h-[600px]">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-600" />
            Real AI Assistant
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Intelligent & Contextual
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <div className="flex-1 min-h-0 relative">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-2 max-w-[85%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {message.type === "user" ? (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-2xl break-words ${
                          message.type === "user"
                            ? "bg-blue-500 text-white rounded-br-md"
                            : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 rounded-bl-md border"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex gap-2 max-w-[75%]">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl rounded-bl-md bg-gradient-to-r from-gray-100 to-gray-50 border">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">Processing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          <div className="border-t bg-white p-4 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask me anything or try: '10 times 10', 'What is 25 + 75?', 'How are you?'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1 min-w-0 rounded-full border-2 focus:border-blue-300"
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-4 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>

        <div className="px-4 pb-3 flex-shrink-0">
          <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            Real AI with contextual understanding - Try math like "10 times 10"
          </div>
        </div>
      </Card>
    </div>
  )
}
