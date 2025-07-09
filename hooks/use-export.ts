"use client"

import { useState, useCallback } from "react"
// Note: xlsx will be automatically imported by next-lite
// If xlsx is not available, we'll create a simple CSV export fallback

interface ExportData {
  format: "excel" | "csv"
  dateRange: { from: Date; to: Date }
  data: any[]
  stats: any
  filename: string
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportData = useCallback(async ({ format, dateRange, data, stats, filename }: ExportData) => {
    setIsExporting(true)

    try {
      // Filter data by date range
      const filteredData = data.filter((item) => {
        const itemDate = new Date(item.created_at)
        return itemDate >= dateRange.from && itemDate <= dateRange.to
      })

      // Prepare data for export
      const exportRows = [
        // Summary sheet data
        ["ABIC Realty Accounting System - Dashboard Export"],
        ["Export Date:", new Date().toLocaleDateString()],
        ["Date Range:", `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`],
        [""],
        ["SUMMARY STATISTICS"],
        ["Total Cash Vouchers:", stats.totalCashVouchers],
        ["Total Cheque Vouchers:", stats.totalChequeVouchers],
        ["Total Cash Amount:", stats.totalCashAmount],
        ["Total Cheque Amount:", stats.totalChequeAmount],
        ["Total Amount:", stats.totalAmount],
        ["Monthly Growth:", `${stats.monthlyGrowth}%`],
        ["Weekly Transactions:", stats.weeklyTransactions],
        ["Pending Approvals:", stats.pendingApprovals],
        [""],
        ["VOUCHER DETAILS"],
        ["Type", "Voucher Number", "Amount", "Paid To", "Status", "Date Created"],
      ]

      // Add voucher data
      filteredData.forEach((voucher) => {
        exportRows.push([
          voucher.type.toUpperCase(),
          voucher.type === "cash" ? voucher.voucher_number : voucher.cheque_no,
          voucher.amount,
          voucher.paid_to,
          voucher.status || "Draft",
          new Date(voucher.created_at).toLocaleDateString(),
        ])
      })

      if (format === "excel") {
        // Try to use xlsx if available, otherwise fallback to CSV
        try {
          const XLSX = await import("xlsx")

          // Create Excel workbook
          const wb = XLSX.utils.book_new()
          const ws = XLSX.utils.aoa_to_sheet(exportRows)

          // Set column widths
          ws["!cols"] = [
            { width: 15 }, // Type
            { width: 20 }, // Voucher Number
            { width: 15 }, // Amount
            { width: 25 }, // Paid To
            { width: 12 }, // Status
            { width: 15 }, // Date
          ]

          XLSX.utils.book_append_sheet(wb, ws, "Dashboard Export")
          XLSX.writeFile(wb, `${filename}.xlsx`)
        } catch (xlsxError) {
          console.warn("XLSX not available, falling back to CSV")
          // Fallback to CSV if xlsx is not available
          createCSVDownload(exportRows, `${filename}.csv`)
        }
      } else {
        // Create CSV
        createCSVDownload(exportRows, `${filename}.csv`)
      }

      // Show success notification
      console.log(`Export completed: ${filename}.${format}`)
    } catch (error) {
      console.error("Export failed:", error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [])

  // Helper function for CSV creation
  const createCSVDownload = (data: any[][], filename: string) => {
    const csvContent = data
      .map((row) => row.map((cell) => (typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell)).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return { exportData, isExporting }
}
