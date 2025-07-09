"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import ChequeVoucherPreview from "@/components/vouchers/cheque-voucher-preview"
import html2canvas from "html2canvas"
import api from "@/lib/api"
import type { ChequeVoucherFormData } from "@/types/cheque-voucher"

const ChequeVoucherPage = () => {
  const searchParams = useSearchParams()
  const accountId = searchParams.get("account_id")
  const previewRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingNumber, setIsLoadingNumber] = useState(false)

  const [formData, setFormData] = useState<ChequeVoucherFormData>({
    account_no: "",
    paid_to: "",
    date: new Date().toISOString().split("T")[0],
    cheque_no: "", // Manual input - no auto-fetch
    pay_to: "",
    cheque_date: new Date().toISOString().split("T")[0],
    amount: "",
    signature: "",
    printed_name: "",
    approved_date: new Date().toISOString().split("T")[0],
  })

  // Initialize with default cheque number format - user can edit
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      cheque_no: "483-0001", // Default format, user can change
    }))
    setIsLoadingNumber(false)
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return "___________"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const formatAmount = (amount: string) => {
    const num = Number.parseFloat(amount || "0")
    const formatted = num.toLocaleString("en-US", { minimumFractionDigits: 2 })
    const parts = formatted.split(".")
    return { main: parts[0], cents: parts[1] || "00" }
  }

  const updateFormData = (field: keyof ChequeVoucherFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const exportAsJPEG = async () => {
    if (!previewRef.current) return

    setIsExporting(true)
    try {
      // Create a temporary landscape container for export
      const exportContainer = document.createElement("div")
      exportContainer.style.position = "absolute"
      exportContainer.style.left = "-9999px"
      exportContainer.style.top = "0"
      exportContainer.style.width = "1100px"
      exportContainer.style.height = "auto"
      exportContainer.style.minHeight = "600px"
      exportContainer.style.backgroundColor = "#ffffff"
      exportContainer.style.padding = "30px"
      exportContainer.style.fontFamily = "Arial, sans-serif"
      exportContainer.style.fontSize = "14px"
      exportContainer.style.color = "#000000"
      exportContainer.style.boxSizing = "border-box"

      const totalAmount = Number.parseFloat(formData.amount || "0")
      const totalParts = formatAmount(totalAmount.toString())

      // Create landscape voucher HTML
      exportContainer.innerHTML = `
        <div style="width: 100%; background: #ffffff; color: #000000; font-family: Arial, sans-serif;">
          <!-- Logo and Title Row -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              <img src="/abiclogo.png" alt="ABIC Logo" style="width: 80px; height: 64px; object-fit: contain; margin-right: 20px;" crossorigin="anonymous" />
            </div>
            <div style="text-align: center; flex: 1;">
              <h1 style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 24px; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 4px; display: inline-block; margin: 0;">CHEQUE VOUCHER</h1>
            </div>
            <div style="width: 100px;"></div>
          </div>
          <!-- Account No Row -->
          <div style="display: flex; justify-content: flex-start; margin-bottom: 12px;">
            <div style="display: flex; align-items: baseline;">
              <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; margin-right: 10px;">Account No.:</span>
              <span style="font-family: 'Arial Narrow', Arial, sans-serif; font-size: 16px; color: #000000; border-bottom: 1px solid #000000; padding: 2px 10px; min-width: 150px; display: inline-block;">
                ${formData.account_no || ""}
              </span>
            </div>
          </div>
          <!-- Paid To Row -->
          <div style="display: flex; justify-content: flex-start; margin-bottom: 15px;">
            <div style="display: flex; align-items: baseline;">
              <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; margin-right: 10px;">Paid to:</span>
              <span style="font-family: 'Arial Narrow', Arial, sans-serif; font-size: 16px; color: #000000; border-bottom: 1px solid #000000; padding: 2px 10px; min-width: 150px; display: inline-block;">
                ${formData.paid_to || ""}
              </span>
            </div>
          </div>
          <!-- Cheque Details Table -->
          <div style="border: 2px solid #000000; margin-bottom: 8px;">
            <!-- Table Header -->
            <div style="display: flex; border-bottom: 2px solid #000000;">
              <div style="flex: 3; text-align: center; font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; letter-spacing: 3px; color: #000000; display: flex; align-items: center; justify-content: center; min-height: 50px; padding: 0; line-height: 1;">
                CHEQUE DETAILS
              </div>
              <div style="flex: 1; text-align: center; font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; border-left: 1px solid #000000; display: flex; align-items: center; justify-content: center; min-height: 50px; padding: 0; line-height: 1;">
                Amount
              </div>
            </div>
            <!-- Cheque Details Content -->
            <div style="min-height: 120px; display: flex;">
              <div style="flex: 3; padding: 10px; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000; border-right: 1px solid #000000;">
                <div style="margin-bottom: 8px;"><strong>Cheque No:</strong> ${formData.cheque_no || ""}</div>
                <div style="margin-bottom: 8px;"><strong>Pay To:</strong> ${formData.pay_to || ""}</div>
                <div style="margin-bottom: 8px;"><strong>Date:</strong> ${formatDate(formData.cheque_date)}</div>
                <div style="margin-bottom: 8px;"><strong>Amount:</strong> ${
                  formData.amount ? `₱${formatAmount(formData.amount).main}.${formatAmount(formData.amount).cents}` : ""
                }</div>
              </div>
              <div style="flex: 1; padding: 10px; display: flex;">
                <span style="flex: 1; text-align: right; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000;">
                  ${formData.amount ? `₱${formatAmount(formData.amount).main}` : ""}
                </span>
                <span style="width: 30px; text-align: left; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000;">
                  ${formData.amount ? `.${formatAmount(formData.amount).cents}` : ""}
                </span>
              </div>
            </div>
            <!-- Total Row -->
            <div style="display: flex;">
              <div style="flex: 3; padding: 10px; text-align: right; font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; border-right: 1px solid #000000;">
                TOTAL ₱
              </div>
              <div style="flex: 1; padding: 10px; display: flex;">
                <span style="flex: 1; text-align: right; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; font-weight: bold; color: #000000;">
                  ${totalParts.main}
                </span>
                <span style="width: 30px; text-align: left; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; font-weight: bold; color: #000000;">
                  .${totalParts.cents}
                </span>
              </div>
            </div>
          </div>
          <!-- Approved By Section - Left aligned -->
          <div style="margin-top: 8px; width: 50%;">
            <div style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; margin-bottom: 12px;">
              Approved By:
            </div>
            
            <div style="margin-bottom: 8px; display: flex; align-items: center;">
              <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 14px; color: #000000; width: 100px;">Signature:</span>
              <div style="width: 190px; border-bottom: 1px solid #000000; padding: 6px 10px 2px 10px; height: 35px; display: flex; align-items: center; justify-content: center;">
                ${
                  formData.signature
                    ? `<img src="${formData.signature}" alt="Signature" style="max-height: 30px; max-width: 100px; object-fit: contain;" crossorigin="anonymous" />`
                    : '<span style="color: #000000; font-family: Arial, sans-serif; font-size: 12px;"></span>'
                }
              </div>
            </div>
            <div style="margin-bottom: 8px; display: flex; align-items: center;">
              <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 14px; color: #000000; width: 100px;">Printed Name:</span>
              <div style="width: 190px; border-bottom: 1px solid #000000; padding: 2px 10px 4px 10px; height: 22px; display: flex; align-items: center;">
                <span style="font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000;">
                  ${formData.printed_name || ""}
                </span>
              </div>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 14px; color: #000000; width: 100px;">Date:</span>
              <div style="width: 190px; border-bottom: 1px solid #000000; padding: 2px 10px 4px 10px; height: 22px; display: flex; align-items: center;">
                <span style="font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000;">
                  ${formatDate(formData.approved_date) !== "___________" ? formatDate(formData.approved_date) : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      `

      // Add to document temporarily
      document.body.appendChild(exportContainer)

      // Wait for images to load
      const images = exportContainer.querySelectorAll("img")
      await Promise.all(
        Array.from(images).map((img) => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(true)
            } else {
              img.onload = () => resolve(true)
              img.onerror = () => resolve(true)
            }
          })
        }),
      )

      // Wait a bit more for rendering
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Get the actual content height
      const contentHeight = exportContainer.scrollHeight
      const finalHeight = Math.max(contentHeight, 500)

      const canvas = await html2canvas(exportContainer, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        logging: false,
        width: 1100,
        height: finalHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1100,
        windowHeight: finalHeight,
      })

      // Remove temporary container
      document.body.removeChild(exportContainer)

      // Create and download the image
      const link = document.createElement("a")
      link.download = `cheque-voucher-${formData.cheque_no || "draft"}.jpg`
      link.href = canvas.toDataURL("image/jpeg", 0.95)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert("Cheque voucher exported successfully!")
    } catch (error) {
      console.error("Error exporting voucher:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Error exporting voucher: ${errorMessage}. Please try again or check that all fields are filled properly.`)
    } finally {
      setIsExporting(false)
    }
  }

  const saveVoucher = async () => {
    setIsSaving(true)
    try {
      // Validate required fields
      if (!formData.cheque_no.trim()) {
        alert("Please enter a cheque number")
        return
      }
      if (!formData.account_no.trim()) {
        alert("Please enter an account number")
        return
      }
      if (!formData.paid_to.trim()) {
        alert("Please enter who this is paid to")
        return
      }
      if (!formData.pay_to.trim()) {
        alert("Please enter the payee name")
        return
      }
      if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
        alert("Please enter a valid amount")
        return
      }
      if (!formData.printed_name.trim()) {
        alert("Please enter the printed name")
        return
      }

      const dataToSave = {
        ...formData,
        // For this standalone page, we don't have account_id
        account_id: null,
      }

      console.log("Saving cheque voucher with data:", dataToSave)
      const response = await api.createChequeVoucher(dataToSave)

      if (response.success) {
        alert("Cheque voucher saved successfully!")
        // Update form with returned data if needed
        if (response.data.cheque_no !== formData.cheque_no) {
          setFormData((prev) => ({
            ...prev,
            cheque_no: response.data.cheque_no,
          }))
        }
      } else {
        throw new Error(response.message || "Failed to save cheque voucher")
      }
    } catch (error) {
      console.error("Error saving cheque voucher:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Error saving cheque voucher: ${errorMessage}. Please try again.`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex gap-2 mb-6">
        <Button onClick={saveVoucher} variant="outline" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Voucher"}
        </Button>
        <Button onClick={exportAsJPEG} disabled={isExporting} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export as JPEG"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section - Improved Layout */}
        <Card>
          <CardHeader>
            <CardTitle>Cheque Voucher Details</CardTitle>
            <CardDescription>Fill in the cheque voucher information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_no">
                    Account No. <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="account_no"
                    value={formData.account_no}
                    onChange={(e) => updateFormData("account_no", e.target.value)}
                    placeholder="Enter account number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData("date", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paid_to">
                    Paid to <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="paid_to"
                    value={formData.paid_to}
                    onChange={(e) => updateFormData("paid_to", e.target.value)}
                    placeholder="Enter recipient name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cheque_no">
                    Cheque No. <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cheque_no"
                    value={formData.cheque_no}
                    onChange={(e) => updateFormData("cheque_no", e.target.value)}
                    placeholder="Enter cheque number (e.g., 483-0001)"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter your cheque number manually (supports formats like 483-0001, 554, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Cheque Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Cheque Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pay_to">
                    Pay To <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pay_to"
                    value={formData.pay_to}
                    onChange={(e) => updateFormData("pay_to", e.target.value)}
                    placeholder="Enter payee name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cheque_date">
                    Cheque Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cheque_date"
                    type="date"
                    value={formData.cheque_date}
                    onChange={(e) => updateFormData("cheque_date", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => updateFormData("amount", e.target.value)}
                  placeholder="500000.00"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Approval Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Approval Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="printed_name">
                    Printed Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="printed_name"
                    value={formData.printed_name}
                    onChange={(e) => updateFormData("printed_name", e.target.value)}
                    placeholder="Enter printed name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approved_date">
                    Approved Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="approved_date"
                    type="date"
                    value={formData.approved_date}
                    onChange={(e) => updateFormData("approved_date", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature">Signature</Label>
                <Input
                  id="signature"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        updateFormData("signature", event.target?.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>Real-time preview of your cheque voucher</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              ref={previewRef}
              className="border border-gray-300 p-4 bg-white voucher-container overflow-x-auto"
              data-voucher-container
            >
              <ChequeVoucherPreview formData={formData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ChequeVoucherPage
