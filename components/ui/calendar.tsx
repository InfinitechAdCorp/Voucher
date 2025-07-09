"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarProps {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  initialFocus?: boolean
  className?: string
}

function Calendar({ className, selected, onSelect, ...props }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(selected || new Date())
  const [viewDate, setViewDate] = React.useState(new Date())

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    setCurrentDate(newDate)
    onSelect?.(newDate)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setViewDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendarDays = () => {
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selected &&
        selected.getDate() === day &&
        selected.getMonth() === viewDate.getMonth() &&
        selected.getFullYear() === viewDate.getFullYear()

      const isToday =
        new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString()

      days.push(
        <Button
          key={day}
          variant="ghost"
          className={cn(
            "h-9 w-9 p-0 font-normal",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            isToday && !isSelected && "bg-accent text-accent-foreground",
            "hover:bg-accent hover:text-accent-foreground",
          )}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </Button>,
      )
    }

    return days
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="space-y-4">
        <div className="flex justify-center pt-1 relative items-center">
          <Button
            variant="outline"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-sm font-medium">
            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
          </div>

          <Button
            variant="outline"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
            onClick={() => navigateMonth("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-full border-collapse space-y-1">
          <div className="flex">
            {dayNames.map((day) => (
              <div key={day} className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mt-2">{renderCalendarDays()}</div>
        </div>
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
