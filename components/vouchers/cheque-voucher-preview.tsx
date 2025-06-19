"use client"

import type { ChequeVoucherFormData } from "@/types/cheque-voucher"

interface ChequeVoucherPreviewProps {
  formData: ChequeVoucherFormData
}

export default function ChequeVoucherPreview({ formData }: ChequeVoucherPreviewProps) {
  const formatAmount = (amount: string) => {
    const num = Number.parseFloat(amount || "0")
    const formatted = num.toLocaleString("en-US", { minimumFractionDigits: 2 })
    const parts = formatted.split(".")
    return { main: parts[0], cents: parts[1] || "00" }
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

  const totalAmount = Number.parseFloat(formData.amount || "0")
  const totalParts = formatAmount(totalAmount.toString())

  return (
    <div
      data-voucher-container
      className="voucher-container bg-white text-black"
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#ffffff",
        color: "#000000",
        minHeight: "400px",
        fontSize: "14px",
        lineHeight: "1.2",
        padding: "16px",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* Logo and Title Container */}
      <div className="flex justify-start items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-24 h-20 flex items-center justify-center">
            <img
              src="/abiclogo.png"
              alt="ABIC Logo"
              className="w-full h-full object-contain"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
              }}
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
              }}
            />
          </div>
        </div>
      </div>

      {/* Centered "CHEQUE VOUCHER" Title */}
      <div className="text-center mb-4">
        <h1
          className="font-bold border-b-2 border-black pb-1 inline-block souvenir-font"
          style={{
            fontFamily: "'Times New Roman', serif",
            fontWeight: "300",
            fontSize: "20px",
            color: "#000000",
            borderBottom: "2px solid #000000",
            paddingBottom: "4px",
            display: "inline-block",
          }}
        >
          CHEQUE VOUCHER
        </h1>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-baseline">
            <span
              className="font-medium mr-2 souvenir-font"
              style={{
                fontFamily: "'Times New Roman', serif",
                fontWeight: "300",
                fontSize: "14px",
                color: "#000000",
              }}
            >
              Account No.:
            </span>
            <span
              className="border-b border-black px-2 arial-narrow-font"
              style={{
                fontFamily: "'Arial Narrow', Arial, sans-serif",
                fontSize: "14px",
                color: "#000000",
                borderBottom: "1px solid #000000",
                paddingLeft: "8px",
                paddingRight: "8px",
                minHeight: "20px",
                width: "150px",
                display: "inline-block",
              }}
            >
              {formData.account_no}
            </span>
          </div>
        </div>

        <div className="flex justify-start items-center">
          <div className="flex items-baseline">
            <span
              className="font-medium mr-2 souvenir-font"
              style={{
                fontFamily: "'Times New Roman', serif",
                fontWeight: "300",
                fontSize: "14px",
                color: "#000000",
              }}
            >
              Paid to:
            </span>
            <span
              className="border-b border-black px-2 arial-narrow-font"
              style={{
                fontFamily: "'Arial Narrow', Arial, sans-serif",
                fontSize: "14px",
                color: "#000000",
                borderBottom: "1px solid #000000",
                paddingLeft: "8px",
                paddingRight: "8px",
                minHeight: "20px",
                width: "150px",
                display: "inline-block",
              }}
            >
              {formData.paid_to}
            </span>
          </div>
        </div>
      </div>

      {/* Cheque Details Table */}
      <div
        className="border border-black mb-4"
        style={{
          border: "1px solid #000000",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #000000",
          }}
        >
          <div
            style={{
              width: "75%",
              fontFamily: "'Times New Roman', serif",
              fontWeight: "300",
              letterSpacing: "3px",
              fontSize: "14px",
              color: "#000000",
              padding: "0",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50px",
              lineHeight: "1",
              borderRight: "1px solid #000000",
            }}
          >
            CHEQUE DETAILS
          </div>

          <div
            style={{
              width: "25%",
              fontFamily: "'Times New Roman', serif",
              fontWeight: "300",
              fontSize: "14px",
              color: "#000000",
              padding: "0",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50px",
              lineHeight: "1",
            }}
          >
            Amount
          </div>
        </div>

        {/* Cheque Details Content */}
        <div
          style={{
            display: "flex",
            position: "relative",
            minHeight: "120px",
          }}
        >
          <div
            style={{
              width: "75%",
              padding: "8px",
              borderRight: "1px solid #000000",
            }}
          >
            <div
              style={{
                fontFamily: "'Arial Narrow', Arial, sans-serif",
                fontSize: "12px",
                color: "#000000",
                width: "100%",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
                minHeight: "100px",
              }}
            >
              <div className="mb-2">
                <strong>Cheque No:</strong> {formData.cheque_no || "Auto-generated on save"}
              </div>
              <div className="mb-2">
                <strong>Pay To:</strong> {formData.pay_to}
              </div>
              <div className="mb-2">
                <strong>Date:</strong> {formatDate(formData.cheque_date)}
              </div>
              <div className="mb-2">
                <strong>Amount:</strong>{" "}
                {formData.amount ? `₱${formatAmount(formData.amount).main}.${formatAmount(formData.amount).cents}` : ""}
              </div>
            </div>
          </div>
          <div
            style={{
              width: "25%",
              padding: "8px",
              textAlign: "right",
              fontFamily: "'Arial Narrow', Arial, sans-serif",
              fontSize: "12px",
              color: "#000000",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
            }}
          >
            {formData.amount ? `₱${formatAmount(formData.amount).main}.${formatAmount(formData.amount).cents}` : ""}
          </div>
        </div>

        {/* Total Row */}
        <div
          style={{
            display: "flex",
          }}
        >
          <div
            style={{
              width: "75%",
              fontFamily: "'Times New Roman', serif",
              fontWeight: "300",
              fontSize: "14px",
              color: "#000000",
              padding: "8px",
              textAlign: "right",
              borderRight: "1px solid #000000",
            }}
          >
            TOTAL ₱
          </div>
          <div
            style={{
              width: "25%",
              fontFamily: "'Arial Narrow', Arial, sans-serif",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#000000",
              padding: "8px",
              textAlign: "right",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            {totalParts.main}.{totalParts.cents}
          </div>
        </div>
      </div>

      {/* Fixed Approved By Section - No floating lines */}
      <div className="mt-4">
        <div className="w-1/2">
          <div
            className="font-bold souvenir-font mb-3"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: "300",
              fontSize: "14px",
              color: "#000000",
            }}
          >
            Approved By:
          </div>
          <div className="space-y-3">
            {/* Signature - Fixed alignment */}
            <div className="flex items-center">
              <span
                className="font-medium souvenir-font"
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontWeight: "300",
                  fontSize: "12px",
                  color: "#000000",
                  width: "80px",
                  flexShrink: 0,
                }}
              >
                Signature:
              </span>
              <div
                style={{
                  width: "190px",
                  borderBottom: "1px solid #000000",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  height: "32px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {formData.signature ? (
                  <img
                    src={formData.signature || "/placeholder.svg"}
                    alt="Signature"
                    style={{
                      maxHeight: "28px",
                      maxWidth: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                    }}
                  />
                ) : (
                  <span
                    className="text-gray-400 arial-narrow-font"
                    style={{
                      fontFamily: "'Arial Narrow', Arial, sans-serif",
                      fontSize: "12px",
                      color: "#666666",
                    }}
                  ></span>
                )}
              </div>
            </div>
            {/* Printed name - Fixed alignment */}
            <div className="flex items-center">
              <span
                className="font-medium souvenir-font"
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontWeight: "300",
                  fontSize: "12px",
                  color: "#000000",
                  width: "80px",
                  flexShrink: 0,
                }}
              >
                Printed Name:
              </span>
              <div
                style={{
                  width: "190px",
                  borderBottom: "1px solid #000000",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  className="arial-narrow-font"
                  style={{
                    fontFamily: "'Arial Narrow', Arial, sans-serif",
                    fontSize: "12px",
                    color: "#000000",
                  }}
                >
                  {formData.printed_name || ""}
                </span>
              </div>
            </div>
            {/* Date - Fixed alignment */}
            <div className="flex items-center">
              <span
                className="font-medium souvenir-font"
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontWeight: "300",
                  fontSize: "12px",
                  color: "#000000",
                  width: "80px",
                  flexShrink: 0,
                }}
              >
                Date:
              </span>
              <div
                style={{
                  width: "190px",
                  borderBottom: "1px solid #000000",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  className="arial-narrow-font"
                  style={{
                    fontFamily: "'Arial Narrow', Arial, sans-serif",
                    fontSize: "12px",
                    color: "#000000",
                  }}
                >
                  {formatDate(formData.approved_date) !== "___________" ? formatDate(formData.approved_date) : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
