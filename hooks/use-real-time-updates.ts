"use client"

import { useEffect, useRef } from "react"

interface RealTimeUpdateOptions {
  onUpdate: (data: any) => void
  interval?: number
}

export function useRealTimeUpdates({ onUpdate, interval = 30000 }: RealTimeUpdateOptions) {
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Simulate real-time updates
    intervalRef.current = setInterval(() => {
      // Simulate different types of updates
      const updateTypes = ["voucher_created", "voucher_updated", "payment_approved", "balance_updated"]

      const randomUpdate = {
        type: updateTypes[Math.floor(Math.random() * updateTypes.length)],
        timestamp: new Date(),
        data: {
          id: Math.floor(Math.random() * 1000),
          amount: Math.floor(Math.random() * 10000) + 1000,
        },
      }

      // Only trigger updates occasionally to avoid spam
      if (Math.random() > 0.8) {
        onUpdate(randomUpdate)
      }
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [onUpdate, interval])
}
