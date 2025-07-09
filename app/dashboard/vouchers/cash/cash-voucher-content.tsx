"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Download, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import CashVoucherPreview from "@/components/vouchers/cash-voucher-preview"
import AccountSelector from "@/components/account-selector"
import ABICLoader from "@/components/abic-loader"
import html2canvas from "html2canvas"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { VoucherFormData, ParticularItem, Account } from "@/types"

const CashVoucherPageContent = () => {
  const searchParams = useSearchParams()
  const initialAccountId = searchParams.get("account_id")
  const previewRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingNumber, setIsLoadingNumber] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccountId || "")
  const { toast } = useToast()

  const [formData, setFormData] = useState<VoucherFormData>({
    amount: "",
    paid_to: "",
    voucher_number: "", // Will be auto-fetched based on selected account
    date: new Date().toISOString().split("T")[0],
    particulars: "",
    particulars_items: [],
    signature: "",
    printed_name: "",
    approved_signature: "",
    approved_name: "",
    approved_date: new Date().toISOString().split("T")[0],
  })

  // Show loader overlay when any loading state is active
  const showLoader = isExporting || isSaving || isLoadingNumber

  // Fetch next voucher number when account changes
  const fetchNextVoucherNumber = async (accountId?: string) => {
    if (!accountId) {
      setFormData((prev) => ({ ...prev, voucher_number: "" }))
      return
    }
    try {
      setIsLoadingNumber(true)
      const response = await api.getNextCashVoucherNumber(accountId)
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          voucher_number: response.voucher_number,
        }))
      }
    } catch (error) {
      console.error("Error fetching next voucher number:", error)
      toast({
        title: "Warning",
        description: "Could not fetch voucher number. Please select an account.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingNumber(false)
    }
  }

  // Handle account selection
  const handleAccountChange = (accountId: string, account: Account) => {
    setSelectedAccountId(accountId)
    setSelectedAccount(account)
    fetchNextVoucherNumber(accountId)
  }

  // Auto-select account if provided in URL
  useEffect(() => {
    if (initialAccountId && !selectedAccountId) {
      setSelectedAccountId(initialAccountId)
    }
  }, [initialAccountId, selectedAccountId])

  // Fetch voucher number when selectedAccountId changes
  useEffect(() => {
    if (selectedAccountId) {
      fetchNextVoucherNumber(selectedAccountId)
    }
  }, [selectedAccountId])

  const validateForm = () => {
    const errors: string[] = []
    // Check if account is selected
    if (!selectedAccountId) {
      errors.push("Please select an account")
    }
    // Check required fields
    if (!formData.paid_to.trim()) {
      errors.push("Paid to is required")
    }
    if (!formData.date) {
      errors.push("Date is required")
    }
    // Check if we have either particulars text or particular items
    const hasParticularsText = formData.particulars && formData.particulars.trim()
    const hasParticularItems = formData.particulars_items && formData.particulars_items.length > 0
    if (!hasParticularsText && !hasParticularItems) {
      errors.push("Particulars are required (either text or items)")
    }
    // Check amount - either main amount or particular items should have amounts
    if (hasParticularItems) {
      const hasValidItems = formData.particulars_items?.some(
        (item) => item.description.trim() && item.amount && Number.parseFloat(item.amount) > 0,
      )
      if (!hasValidItems) {
        errors.push("At least one particular item must have a description and amount")
      }
    } else if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      errors.push("Amount must be greater than 0")
    }
    if (!formData.printed_name.trim()) {
      errors.push("Received by (Printed Name) is required")
    }
    if (!formData.approved_name.trim()) {
      errors.push("Approved by (Printed Name) is required")
    }
    if (!formData.approved_date) {
      errors.push("Approved date is required")
    }
    return errors
  }

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

  const calculateTotal = () => {
    if (formData.particulars_items && formData.particulars_items.length > 0) {
      return formData.particulars_items.reduce((sum, item) => sum + Number.parseFloat(item.amount || "0"), 0)
    }
    return Number.parseFloat(formData.amount || "0")
  }

  const totalAmount = calculateTotal()
  const totalParts = formatAmount(totalAmount.toString())

  const updateFormData = (field: keyof VoucherFormData, value: string | ParticularItem[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addParticularItem = () => {
    const newItem: ParticularItem = { description: "", amount: "" }
    setFormData((prev) => ({
      ...prev,
      particulars_items: [...(prev.particulars_items || []), newItem],
    }))
  }

  const updateParticularItem = (index: number, field: keyof ParticularItem, value: string) => {
    const updatedItems = [...(formData.particulars_items || [])]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setFormData((prev) => ({ ...prev, particulars_items: updatedItems }))
  }

  const removeParticularItem = (index: number) => {
    const updatedItems = formData.particulars_items?.filter((_, i) => i !== index) || []
    setFormData((prev) => ({ ...prev, particulars_items: updatedItems }))
  }

  const exportAsJPEG = async () => {
    // Validate form before exporting
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      })
      return
    }

    if (!previewRef.current) return

    setIsExporting(true)
    try {
      // Create a temporary landscape container for export with reduced height
      const exportContainer = document.createElement("div")
      exportContainer.style.position = "absolute"
      exportContainer.style.left = "-9999px"
      exportContainer.style.top = "0"
      exportContainer.style.width = "1100px" // Landscape width
      exportContainer.style.height = "auto" // Let content determine height
      exportContainer.style.minHeight = "600px" // Minimum height
      exportContainer.style.backgroundColor = "#ffffff"
      exportContainer.style.padding = "30px"
      exportContainer.style.fontFamily = "Arial, sans-serif"
      exportContainer.style.fontSize = "14px"
      exportContainer.style.color = "#000000"
      exportContainer.style.boxSizing = "border-box"

      // Create landscape voucher HTML with tighter spacing
      exportContainer.innerHTML = `
        <div style="width: 100%; background: #ffffff; color: #000000; font-family: Arial, sans-serif;">
          <!-- Logo and Title Row -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              <img src="/abiclogo.png" alt="ABIC Logo" style="width: 80px; height: 64px; object-fit: contain; margin-right: 20px;" crossorigin="anonymous" />
            </div>
            <div style="text-align: center; flex: 1;">
              <h1 style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 24px; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 4px; display: inline-block; margin: 0;">CASH VOUCHER</h1>
            </div>
            <div style="width: 100px;"></div>
          </div>
          <!-- Amount and Voucher Info Row -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: baseline;">
              <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; margin-right: 10px;">Amount:</span>
              <span style="font-family: 'Arial Narrow', Arial, sans-serif; font-size: 16px; color: #000000; border-bottom: 1px solid #000000; padding: 2px 10px; min-width: 200px; display: inline-block;">
                ${totalAmount > 0 ? `₱${totalParts.main}.${totalParts.cents}` : ""}
              </span>
            </div>
            <div style="display: flex; align-items: baseline;">
              <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; margin-right: 10px;">Voucher No:</span>
              <span style="font-family: 'Arial Narrow', Arial, sans-serif; font-size: 16px; color: #000000; border-bottom: 1px solid #000000; padding: 2px 10px; min-width: 150px; display: inline-block;">
                ${formData.voucher_number || ""}
              </span>
            </div>
          </div>
          <!-- Paid To and Date Row -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div style="display: flex; align-items: baseline;">
              <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; margin-right: 10px;">Paid to:</span>
              <span style="font-family: 'Arial Narrow', Arial, sans-serif; font-size: 16px; color: #000000; border-bottom: 1px solid #000000; padding: 2px 10px; min-width: 300px; display: inline-block;">
                ${formData.paid_to || ""}
              </span>
            </div>
            <div style="display: flex; align-items: baseline;">
              <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; margin-right: 10px;">Date:</span>
              <span style="font-family: 'Arial Narrow', Arial, sans-serif; font-size: 16px; color: #000000; border-bottom: 1px solid #000000; padding: 2px 10px; min-width: 150px; display: inline-block;">
                ${formatDate(formData.date)}
              </span>
            </div>
          </div>
          <!-- Particulars Table -->
          <div style="border: 2px solid #000000; margin-bottom: 8px;">
            <!-- Table Header -->
            <div style="display: flex; border-bottom: 2px solid #000000;">
              <div style="flex: 3; padding: 10px; text-align: center; font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; letter-spacing: 3px; color: #000000;">
                PARTICULARS
              </div>
              <div style="flex: 1; padding: 10px; text-align: center; font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; border-left: 1px solid #000000;">
                Amount
              </div>
            </div>
            <!-- Particulars Content -->
            <div style="min-height: 100px; display: flex;">
              <div style="flex: 3; padding: 10px; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000; border-right: 1px solid #000000;">
                ${
                  formData.particulars_items && formData.particulars_items.length > 0
                    ? formData.particulars_items
                        .map((item) => `<div style="margin-bottom: 6px;">${item.description}</div>`)
                        .join("")
                    : formData.particulars || ""
                }
              </div>
              <div style="flex: 1; padding: 10px; position: relative;">
                <!-- Move vertical line further from right edge -->
                <div style="position: absolute; right: 50px; top: 0; bottom: 0; width: 2px; background-color: #000000;"></div>
                ${
                  formData.particulars_items && formData.particulars_items.length > 0
                    ? formData.particulars_items
                        .map((item) => {
                          const itemAmount = formatAmount(item.amount || "0")
                          return `<div style="margin-bottom: 6px; display: flex;">
                <span style="flex: 1; text-align: left; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000; padding-left: 8px; padding-right: 8px;">
                  ${item.amount ? `${itemAmount.main}` : ""}
                </span>
                <span style="width: 40px; text-align: left; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000; padding-left: 8px;">
                  ${item.amount ? `.${itemAmount.cents}` : ""}
                </span>
              </div>`
                        })
                        .join("")
                    : `<div style="display: flex; height: 100%; align-items: flex-start;">
        <span style="flex: 1; text-align: left; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000; padding-left: 8px; padding-right: 8px;">
          ${formData.amount ? `${formatAmount(formData.amount).main}` : ""}
        </span>
        <span style="width: 40px; text-align: left; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000; padding-left: 8px;">
          ${formData.amount ? `.${formatAmount(formData.amount).cents}` : ""}
        </span>
      </div>`
                }
              </div>
            </div>
            <!-- Total Row -->
            <div style="display: flex;">
              <div style="flex: 3; padding: 10px; text-align: right; font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; border-right: 1px solid #000000;">
                TOTAL ₱
              </div>
              <div style="flex: 1; padding: 10px; display: flex; position: relative;">
                <!-- Move vertical line further from right edge -->
                <div style="position: absolute; right: 50px; top: 0; bottom: 0; width: 2px; background-color: #000000;"></div>
                <span style="flex: 1; text-align: left; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 16px; font-weight: bold; color: #000000; padding-left: 8px; padding-right: 8px;">
                  ${totalParts.main}
                </span>
                <span style="width: 40px; text-align: left; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 16px; font-weight: bold; color: #000000; padding-left: 8px;">
                  .${totalParts.cents}
                </span>
              </div>
            </div>
          </div>
          <!-- Signatures Section -->
          <div style="display: flex; justify-content: space-between; margin-top: 8px;">
            <!-- Received By -->
            <div style="width: 280px;">
              <div style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; margin-bottom: 12px;">
                RECEIVED BY:
              </div>
              
              <div style="border-bottom: 1px solid #000000; padding: 4px; height: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                ${
                  formData.signature
                    ? `<img src="${formData.signature}" alt="Signature" style="max-height: 45px; max-width: 200px; object-fit: contain;" crossorigin="anonymous" />`
                    : '<span style="color: #666666; font-family: Arial, sans-serif; font-size: 12px;">Signature</span>'
                }
              </div>
              
              <div style="text-align: center; margin-bottom: 8px;">
                <span style="font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000;">
                  ${formData.printed_name || ""}
                </span>
              </div>
              
              <div style="text-align: center; font-family: 'Times New Roman', serif; font-weight: 300; font-size: 12px; color: #000000;">
                Signature Over Printed Name
              </div>
            </div>
            <!-- Approved By - Aligned to the right edge -->
            <div style="width: 280px; margin-left: auto;">
              <div style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; margin-bottom: 12px;">
                APPROVED BY:
              </div>
              
              <div style="margin-bottom: 8px; display: flex; align-items: center;">
                <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 14px; color: #000000; width: 80px;">Signature:</span>
                <div style="flex: 1; border-bottom: 1px solid #000000; padding: 4px; height: 35px; display: flex; align-items: center; justify-content: center;">
                  ${
                    formData.approved_signature
                      ? `<img src="${formData.approved_signature}" alt="Approved Signature" style="max-height: 30px; max-width: 150px; object-fit: contain;" crossorigin="anonymous" />`
                      : '<span style="color: #666666; font-family: Arial, sans-serif; font-size: 12px;">Signature</span>'
                  }
                </div>
              </div>
              
              <div style="margin-bottom: 8px; display: flex; align-items: center;">
                <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 14px; color: #000000; width: 80px;">Printed name:</span>
                <div style="flex: 1; border-bottom: 1px solid #000000; padding: 4px; height: 22px; display: flex; align-items: center;">
                  <span style="font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000;">
                    ${formData.approved_name || ""}
                  </span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 14px; color: #000000; width: 80px;">Date:</span>
                <div style="flex: 1; border-bottom: 1px solid #000000; padding: 4px; height: 22px; display: flex; align-items: center;">
                  <span style="font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000;">
                    ${formatDate(formData.approved_date)}
                  </span>
                </div>
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
      const finalHeight = Math.max(contentHeight, 500) // Minimum 500px

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

      // Verify canvas has content
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      let hasContent = false
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
          hasContent = true
          break
        }
      }

      if (!hasContent) {
        throw new Error("Canvas appears to be empty - the voucher may not have rendered properly")
      }

      // Create and download the image
      const link = document.createElement("a")
      link.download = `cash-voucher-${formData.voucher_number || "draft"}.jpg`
      link.href = canvas.toDataURL("image/jpeg", 0.95)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: `Cash voucher ${formData.voucher_number} has been exported successfully.`,
      })
    } catch (error) {
      console.error("Error exporting voucher:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Export Failed",
        description: `Error exporting voucher: ${errorMessage}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const saveVoucher = async () => {
    // Validate form before saving
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Include account_id in the data to save
      const dataToSave = {
        ...formData,
        account_id: selectedAccountId ? Number.parseInt(selectedAccountId) : undefined,
      }

      // Debug: Log the data being sent
      console.log("Saving voucher with data:", dataToSave)

      const response = await api.createCashVoucher(dataToSave)
      if (response.success) {
        toast({
          title: "Success",
          description: `Cash voucher ${formData.voucher_number} has been saved successfully!`,
        })
        // The voucher number should already be correct, but update if backend returns a different one
        if (response.data.voucher_number !== formData.voucher_number) {
          setFormData((prev) => ({
            ...prev,
            voucher_number: response.data.voucher_number,
          }))
        }
      } else {
        throw new Error(response.message || "Failed to save voucher")
      }
    } catch (error) {
      console.error("Error saving voucher:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Save Failed",
        description: `Error saving voucher: ${errorMessage}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative">
      {/* Loader Overlay */}
      {showLoader && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <ABICLoader
              size="lg"
              text={
                isExporting
                  ? "Exporting voucher to JPEG..."
                  : isSaving
                    ? "Saving voucher to database..."
                    : isLoadingNumber
                      ? "Generating voucher number..."
                      : "Processing..."
              }
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Action buttons - moved to top */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/dashboard/accounts">
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Accounts
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={saveVoucher}
              variant="outline"
              disabled={isSaving}
              className="w-full sm:w-auto bg-transparent"
            >
              {isSaving ? "Saving..." : "Save Voucher"}
            </Button>
            <Button
              onClick={exportAsJPEG}
              disabled={isExporting}
              className="flex items-center w-full sm:w-auto"
              style={{
                backgroundColor: isExporting ? "#a24c9a" : "#b94ba7",
                color: "white",
                cursor: isExporting ? "not-allowed" : "pointer",
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export as JPEG"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Form Section - Improved Layout */}
          <Card>
            <CardHeader>
              <CardTitle>Voucher Details</CardTitle>
              <CardDescription>Fill in the voucher information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Selection Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Account Selection</h3>
                <AccountSelector
                  selectedAccountId={selectedAccountId}
                  onAccountChange={handleAccountChange}
                  required={true}
                />
                {selectedAccount && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Selected Account:</p>
                      <p className="text-blue-700">
                        {selectedAccount.account_name} (#{selectedAccount.account_number})
                      </p>
                      {selectedAccount.account_type && (
                        <p className="text-blue-600">Type: {selectedAccount.account_type}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voucher_number">Voucher No.</Label>
                    <Input
                      id="voucher_number"
                      value={
                        isLoadingNumber
                          ? "Loading..."
                          : formData.voucher_number ||
                            (selectedAccountId ? "Select account first" : "No account selected")
                      }
                      disabled
                      placeholder="Select an account to generate voucher number"
                      className={!selectedAccountId ? "text-gray-400" : ""}
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
              </div>

              {/* Particulars Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-2 gap-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Particulars <span className="text-red-500">*</span>
                  </h3>
                  <Button
                    type="button"
                    onClick={addParticularItem}
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                {formData.particulars_items && formData.particulars_items.length > 0 ? (
                  <div className="space-y-3">
                    {formData.particulars_items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-7">
                            <Label className="text-sm">
                              Description <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              placeholder="Enter description"
                              value={item.description}
                              onChange={(e) => updateParticularItem(index, "description", e.target.value)}
                              required
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <Label className="text-sm">
                              Amount <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              placeholder="0.00"
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.amount}
                              onChange={(e) => updateParticularItem(index, "amount", e.target.value)}
                              required
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <Button
                              type="button"
                              onClick={() => removeParticularItem(index)}
                              size="sm"
                              variant="outline"
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded">
                      <strong>
                        Total: ₱{totalParts.main}.{totalParts.cents}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="particulars">
                        Particulars (Text) <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="particulars"
                        value={formData.particulars}
                        onChange={(e) => updateFormData("particulars", e.target.value)}
                        placeholder="Enter particulars or use Add Item button above"
                        rows={4}
                        required
                      />
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
                )}
              </div>

              {/* Signatures Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Signatures</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="printed_name">
                      Received By (Printed Name) <span className="text-red-500">*</span>
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
                    <Label htmlFor="signature">Received By Signature</Label>
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
              </div>

              {/* Approval Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Approval Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="approved_name">
                      Approved By (Printed Name) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="approved_name"
                      value={formData.approved_name}
                      onChange={(e) => updateFormData("approved_name", e.target.value)}
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
                  <Label htmlFor="approved_signature">Approved By Signature</Label>
                  <Input
                    id="approved_signature"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          updateFormData("approved_signature", event.target?.result as string)
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
              <CardDescription>Real-time preview of your cash voucher</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                ref={previewRef}
                className="border border-gray-300 p-4 bg-white voucher-container overflow-x-auto"
                data-voucher-container
              >
                <CashVoucherPreview formData={formData} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CashVoucherPageContent
