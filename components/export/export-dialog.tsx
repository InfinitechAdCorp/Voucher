"use client"

import { useState } from "react"
import { Calendar, Download, FileSpreadsheet, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Add this helper function at the top of the file after the imports
const formatDate = (date: Date, format: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }
  return date.toLocaleDateString("en-US", options)
}

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (format: "excel" | "csv", dateRange: { from: Date; to: Date }) => void
  isExporting: boolean
}

export function ExportDialog({ open, onOpenChange, onExport, isExporting }: ExportDialogProps) {
  const [format, setFormat] = useState<"excel" | "csv">("excel")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })
  const [showFromCalendar, setShowFromCalendar] = useState(false)
  const [showToCalendar, setShowToCalendar] = useState(false)

  const handleExport = () => {
    onExport(format, dateRange)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Dashboard Data</DialogTitle>
          <DialogDescription>Choose the format and date range for your export</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={format} onValueChange={(value: "excel" | "csv") => setFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                  Excel (.xlsx) - Recommended
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center cursor-pointer">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  CSV (.csv)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500">From</Label>
                <Popover open={showFromCalendar} onOpenChange={setShowFromCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatDate(dateRange.from, "MMM dd, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => {
                        if (date) {
                          setDateRange((prev) => ({ ...prev, from: date }))
                          setShowFromCalendar(false)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-xs text-gray-500">To</Label>
                <Popover open={showToCalendar} onOpenChange={setShowToCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatDate(dateRange.to, "MMM dd, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => {
                        if (date) {
                          setDateRange((prev) => ({ ...prev, to: date }))
                          setShowToCalendar(false)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
