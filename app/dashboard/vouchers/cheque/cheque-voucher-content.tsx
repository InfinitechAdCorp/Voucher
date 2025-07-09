"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import ChequeVoucherPreview from "@/components/vouchers/cheque-voucher-preview"
import html2canvas from "html2canvas"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import ABICLoader from "@/components/abic-loader"
import type { ChequeVoucherFormData } from "@/types/cheque-voucher"

interface Account {
  id: number
  account_name: string
  account_number: string
}

const ChequeVoucherPageContent = () => {
  const searchParams = useSearchParams()
  const accountId = searchParams.get("account_id")
  const previewRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingNumber, setIsLoadingNumber] = useState(false)
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState<ChequeVoucherFormData>({
    account_id: accountId || "",
    account_no: "", // This is manual input - separate from cheque generation
    paid_to: "",
    date: new Date().toISOString().split("T")[0],
    cheque_no: "", // This is auto-generated from selected account
    pay_to: "",
    cheque_date: new Date().toISOString().split("T")[0],
    amount: "",
    signature: "",
    printed_name: "",
    approved_date: new Date().toISOString().split("T")[0],
  })
  const showLoader = isExporting || isSaving || isLoadingNumber
  // Fetch accounts on component load
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoadingAccounts(true)
        const response = await api.getAccounts()

        let accountsData: Account[] = []
        if (response?.data) {
          if (Array.isArray(response.data)) {
            accountsData = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            accountsData = response.data.data
          }
        }

        setAccounts(accountsData || [])

        // If account_id is provided in URL, set it and generate cheque number
        if (accountId) {
          const selectedAccount = accountsData.find((acc) => acc.id.toString() === accountId)
          if (selectedAccount) {
            setFormData((prev) => ({
              ...prev,
              account_id: accountId,
            }))
            // Generate cheque number based on selected account's account_number
            fetchNextChequeNumber(selectedAccount.account_number)
          }
        }
      } catch (error) {
        console.error("Error fetching accounts:", error)
      } finally {
        setIsLoadingAccounts(false)
      }
    }

    fetchAccounts()
  }, [accountId])

  // Generate cheque number based on selected account's database account_number
  const fetchNextChequeNumber = async (accountNumber: string) => {
    if (!accountNumber) {
      setFormData((prev) => ({ ...prev, cheque_no: "" }))
      return
    }

    try {
      setIsLoadingNumber(true)
      console.log("Fetching next cheque number for account:", accountNumber)

      // Use the account number from database to generate the next cheque number
      const response = await api.getNextChequeVoucherNumber(accountNumber)

      if (response.success) {
        console.log("Generated cheque number:", response.cheque_number)
        setFormData((prev) => ({
          ...prev,
          cheque_no: response.cheque_number, // This is auto-generated (554, 555, 556...)
        }))
      } else {
        throw new Error(response.message || "Failed to generate cheque number")
      }
    } catch (error) {
      console.error("Error fetching next cheque number:", error)
      toast({
        title: "Warning",
        description: "Could not fetch cheque number. Please try again.",
        variant: "destructive",
      })
      setFormData((prev) => ({
        ...prev,
        cheque_no: "",
      }))
    } finally {
      setIsLoadingNumber(false)
    }
  }

  // Handle account selection from dropdown - REQUIRED
  const handleAccountChange = (accountId: string) => {
    const selectedAccount = accounts.find((acc) => acc.id.toString() === accountId)
    if (selectedAccount) {
      setFormData((prev) => ({
        ...prev,
        account_id: accountId,
        // DO NOT change account_no - it's manual input
      }))
      // Generate cheque number based on SELECTED ACCOUNT's account_number from database
      fetchNextChequeNumber(selectedAccount.account_number)
    } else {
      setFormData((prev) => ({
        ...prev,
        account_id: "",
        cheque_no: "", // Clear cheque number when no account selected
      }))
    }
  }

  // Handle manual Account No. input - completely separate from cheque generation
  const handleAccountNumberChange = (accountNumber: string) => {
    setFormData((prev) => ({
      ...prev,
      account_no: accountNumber, // This is manual input only
    }))
    // DO NOT generate cheque number based on this manual input
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.account_id) {
      errors.push("Please select an account from dropdown")
    }
    if (!formData.account_no.trim()) {
      errors.push("Account number is required")
    }
    if (!formData.cheque_no) {
      errors.push("Cheque number could not be generated")
    }
    if (!formData.paid_to.trim()) {
      errors.push("Paid to is required")
    }
    if (!formData.date) {
      errors.push("Date is required")
    }
    if (!formData.pay_to.trim()) {
      errors.push("Pay To is required")
    }
    if (!formData.cheque_date) {
      errors.push("Cheque Date is required")
    }
    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      errors.push("Amount must be greater than 0")
    }
    if (!formData.printed_name.trim()) {
      errors.push("Printed Name is required")
    }
    if (!formData.approved_date) {
      errors.push("Approved Date is required")
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

  const updateFormData = (field: keyof ChequeVoucherFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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
              <div style="width: 75%; text-align: center; font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; letter-spacing: 3px; color: #000000; display: flex; align-items: center; justify-content: center; min-height: 50px; padding: 0; line-height: 1; border-right: 1px solid #000000;">
                CHEQUE DETAILS
              </div>
              <div style="width: 25%; text-align: center; font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; display: flex; align-items: center; justify-content: center; min-height: 50px; padding: 0; line-height: 1;">
                Amount
              </div>
            </div>
            <!-- Cheque Details Content -->
            <div style="min-height: 120px; display: flex;">
              <div style="width: 75%; padding: 10px; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000; border-right: 1px solid #000000;">
                <div style="margin-bottom: 8px;"><strong>Cheque No:</strong> ${formData.cheque_no || ""}</div>
                <div style="margin-bottom: 8px;"><strong>Pay To:</strong> ${formData.pay_to || ""}</div>
                <div style="margin-bottom: 8px;"><strong>Date:</strong> ${formatDate(formData.cheque_date)}</div>
                <div style="margin-bottom: 8px;"><strong>Amount:</strong> ${
                  formData.amount ? `${formatAmount(formData.amount).main}.${formatAmount(formData.amount).cents}` : ""
                }</div>
              </div>
              <div style="width: 25%; padding: 10px; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000; display: flex; align-items: flex-end; justify-content: start; position: relative;">
                <!-- Continuous vertical line continues here -->
                <div style="position: absolute; left: 60%; top: 0; bottom: 0; width: 1px; background-color: #000000;"></div>
                <!-- Amount display -->
                <div style="width: 100%; display: flex;">
                  <div style="width: 60%; text-align: start; padding-right: 5px;">
                    ${formData.amount ? formatAmount(formData.amount).main : ""}
                  </div>
                  <div style="width: 40%; text-align: left; padding-left: 5px;">
                    .${formData.amount ? formatAmount(formData.amount).cents : ""}
                  </div>
                </div>
              </div>
            </div>
            <!-- Total Row -->
            <div style="display: flex;">
              <div style="width: 75%; padding: 10px; text-align: right; font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; border-right: 1px solid #000000;">
                TOTAL ₱
              </div>
              <div style="width: 25%; padding: 10px; font-family: 'Arial Narrow', Arial, sans-serif; font-size: 16px; font-weight: bold; color: #000000; position: relative;">
                <!-- Continuous vertical line continues here -->
                <div style="position: absolute; left: 60%; top: 0; bottom: 0; width: 1px; background-color: #000000;"></div>
                <!-- Total amount display -->
                <div style="width: 100%; display: flex;">
                  <div style="width: 60%; text-align: start; padding-right: 5px; font-weight: normal;">
                    ${totalParts.main}
                  </div>
                  <div style="width: 40%; text-align: left; padding-left: 5px; font-weight: normal;">
                    .${totalParts.cents}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Approved By Section - Left aligned with proper line alignment -->
          <div style="margin-top: 8px; width: 50%;">
            <div style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 16px; color: #000000; margin-bottom: 12px;">
              Approved By:
            </div>
            
            <div style="margin-bottom: 12px; display: flex; align-items: flex-end;">
              <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 14px; color: #000000; width: 100px; padding-bottom: 2px;">Signature:</span>
              <div style="width: 190px; border-bottom: 1px solid #000000; height: 35px; display: flex; align-items: center; justify-content: center; margin-left: 0;">
                ${
                  formData.signature
                    ? `<img src="${formData.signature}" alt="Signature" style="max-height: 30px; max-width: 100px; object-fit: contain;" crossorigin="anonymous" />`
                    : '<span style="color: #000000; font-family: Arial, sans-serif; font-size: 12px;"></span>'
                }
              </div>
            </div>
            <div style="margin-bottom: 12px; display: flex; align-items: flex-end;">
              <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 14px; color: #000000; width: 100px; padding-bottom: 2px;">Printed Name:</span>
              <div style="width: 190px; border-bottom: 1px solid #000000; height: 22px; display: flex; align-items: center; margin-left: 0; padding-left: 10px;">
                <span style="font-family: 'Arial Narrow', Arial, sans-serif; font-size: 14px; color: #000000;">
                  ${formData.printed_name || ""}
                </span>
              </div>
            </div>
            <div style="display: flex; align-items: flex-end;">
              <span style="font-family: 'Times New Roman', serif; font-weight: 300; font-size: 14px; color: #000000; width: 100px; padding-bottom: 2px;">Date:</span>
              <div style="width: 190px; border-bottom: 1px solid #000000; height: 22px; display: flex; align-items: center; margin-left: 0; padding-left: 10px;">
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

      toast({
        title: "Export Successful",
        description: `Cheque voucher ${formData.cheque_no} has been exported successfully.`,
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
      const dataToSave = {
        ...formData,
        // Convert account_id to number if it exists
        account_id: formData.account_id ? Number.parseInt(formData.account_id) : null,
      }

      console.log("Saving cheque voucher with data:", dataToSave)
      console.log("Cheque No (auto-generated):", dataToSave.cheque_no)
      console.log("Account No (manual input):", dataToSave.account_no)

      const response = await api.createChequeVoucher(dataToSave)

      if (response.success) {
        toast({
          title: "Success",
          description: `Cheque voucher ${formData.cheque_no} has been saved successfully!`,
        })
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
      toast({
        title: "Save Failed",
        description: `Error saving cheque voucher: ${errorMessage}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
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
            <CardTitle>Cheque Voucher Details</CardTitle>
            <CardDescription>Fill in the cheque voucher information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Account Selection Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Account Selection</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account_id">
                    Select Account <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.account_id} onValueChange={handleAccountChange} disabled={isLoadingAccounts}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingAccounts ? "Loading accounts..." : "Select an account"} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{account.account_name}</span>
                            <span className="text-sm text-muted-foreground">Account #{account.account_number}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">This determines the cheque number sequence</p>
                </div>

                {/* Selected Account Display */}
                {formData.account_id && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-900 mb-1">Selected Account:</div>
                    <div className="text-blue-800">
                      {accounts.find((acc) => acc.id.toString() === formData.account_id)?.account_name}
                      (#{accounts.find((acc) => acc.id.toString() === formData.account_id)?.account_number})
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_no">
                    Account No. <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="account_no"
                    value={formData.account_no}
                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                    placeholder="Enter account number manually"
                    required
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">Manual input - separate from cheque number generation</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cheque_no">Cheque No. (Auto-generated)</Label>
                  <Input
                    id="cheque_no"
                    value={
                      isLoadingNumber ? "Generating..." : formData.cheque_no || "Select account from dropdown first"
                    }
                    disabled
                    className="bg-gray-50 font-mono text-lg"
                    placeholder="Will be generated based on selected account"
                  />
                  {!formData.account_id && (
                    <p className="text-sm text-red-500">
                      ⚠️ Select an account from dropdown above to generate cheque number
                    </p>
                  )}
                  {formData.account_id && (
                    <p className="text-sm text-green-600">
                      ✅ Generated based on:{" "}
                      {accounts.find((acc) => acc.id.toString() === formData.account_id)?.account_name} (#
                      {accounts.find((acc) => acc.id.toString() === formData.account_id)?.account_number})
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {/* Cheque Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Cheque Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

export default ChequeVoucherPageContent
