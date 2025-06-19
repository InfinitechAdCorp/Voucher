"use client"

import type { VoucherFormData } from "@/types"

interface CashVoucherPreviewProps {
  formData: VoucherFormData
}

export default function CashVoucherPreview({ formData }: CashVoucherPreviewProps) {
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

  const calculateTotal = () => {
    if (formData.particulars_items && formData.particulars_items.length > 0) {
      return formData.particulars_items.reduce((sum, item) => sum + Number.parseFloat(item.amount || "0"), 0)
    }
    return Number.parseFloat(formData.amount || "0")
  }

  const totalAmount = calculateTotal()
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

      {/* Centered "CASH VOUCHER" Title */}
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
          CASH VOUCHER
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
              Amount:
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
                width: "200px",
                display: "inline-block",
              }}
            >
              {totalAmount > 0 ? `₱${totalParts.main}.${totalParts.cents}` : ""}
            </span>
          </div>
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
              Voucher No:
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
                width: "120px",
                display: "inline-block",
              }}
            >
              {formData.voucher_number || "443-25-0001"}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
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
                width: "200px",
                display: "inline-block",
              }}
            >
              {formData.paid_to}
            </span>
          </div>
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
              Date:
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
                width: "120px",
                display: "inline-block",
              }}
            >
              {formatDate(formData.date)}
            </span>
          </div>
        </div>
      </div>

      {/* Particulars Table */}
      <div
        className="border border-black mb-4"
        style={{
          border: "1px solid #000000",
          marginBottom: "16px",
        }}
      >
        <div
          className="grid grid-cols-3 border-b border-black"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            borderBottom: "1px solid #000000",
          }}
        >
          <div
            className="p-2 text-center souvenir-font"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: "300",
              letterSpacing: "3px",
              fontSize: "14px",
              color: "#000000",
              padding: "8px",
              textAlign: "center",
            }}
          >
            PARTICULARS
          </div>

          <div
            className="p-2 text-center souvenir-font"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: "300",
              fontSize: "14px",
              color: "#000000",
              padding: "8px",
              textAlign: "center",
            }}
          >
            Amount
          </div>
        </div>

        {/* Particulars Items */}
        {formData.particulars_items && formData.particulars_items.length > 0 ? (
          formData.particulars_items.map((item, index) => {
            const itemAmount = formatAmount(item.amount || "0")
            return (
              <div
                key={index}
                className="grid grid-cols-3 border-black"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  minHeight: "25px",
                }}
              >
                <div
                  className="p-2 border-r border-black arial-narrow-font"
                  style={{
                    fontFamily: "'Arial Narrow', Arial, sans-serif",
                    fontSize: "12px",
                    color: "#000000",
                    padding: "8px",
                    borderRight: "1px solid #000000",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {item.description}
                </div>
                <div
                  className="relative"
                  style={{
                    position: "relative",
                  }}
                >
                  <div
                    className="absolute inset-0 grid grid-cols-2"
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      right: "0",
                      bottom: "0",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                    }}
                  >
                    <div
                      className="p-2 text-right border-r border-black arial-narrow-font"
                      style={{
                        fontFamily: "'Arial Narrow', Arial, sans-serif",
                        fontSize: "12px",
                        color: "#000000",
                        padding: "8px",
                        textAlign: "right",
                        borderRight: "1px solid #000000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      {item.amount ? `₱${itemAmount.main}` : ""}
                    </div>
                    <div
                      className="p-2 text-left arial-narrow-font"
                      style={{
                        fontFamily: "'Arial Narrow', Arial, sans-serif",
                        fontSize: "12px",
                        color: "#000000",
                        padding: "8px",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {item.amount ? `.${itemAmount.cents}` : ""}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div
            className="grid grid-cols-3 relative"
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              position: "relative",
              minHeight: "50px",
            }}
          >
            <div
              className="p-2 border-r border-black"
              style={{
                padding: "8px",
                borderRight: "1px solid #000000",
              }}
            >
              <div
                className="w-full leading-relaxed whitespace-pre-wrap arial-narrow-font"
                style={{
                  fontFamily: "'Arial Narrow', Arial, sans-serif",
                  fontSize: "12px",
                  color: "#000000",
                  width: "100%",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                  minHeight: "35px",
                }}
              >
                {formData.particulars || ""}
              </div>
            </div>
            <div
              className="relative"
              style={{
                position: "relative",
              }}
            >
              <div
                className="absolute inset-0 grid grid-cols-2"
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  right: "0",
                  bottom: "0",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                }}
              >
                <div
                  className="p-2 text-right border-r border-black arial-narrow-font"
                  style={{
                    fontFamily: "'Arial Narrow', Arial, sans-serif",
                    fontSize: "12px",
                    color: "#000000",
                    padding: "8px",
                    textAlign: "right",
                    borderRight: "1px solid #000000",
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  {formData.amount ? `₱${formatAmount(formData.amount).main}` : ""}
                </div>
                <div
                  className="p-2 text-left arial-narrow-font"
                  style={{
                    fontFamily: "'Arial Narrow', Arial, sans-serif",
                    fontSize: "12px",
                    color: "#000000",
                    padding: "8px",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  {formData.amount ? `.${formatAmount(formData.amount).cents}` : ""}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total Row */}
        <div
          className="grid grid-cols-3"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
          }}
        >
          <div
            className="p-2 text-right border-r border-black souvenir-font"
            style={{
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
            className="relative"
            style={{
              position: "relative",
            }}
          >
            <div
              className="absolute inset-0 grid grid-cols-2"
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <div
                className="p-2 text-right border-r border-black arial-narrow-font"
                style={{
                  fontFamily: "'Arial Narrow', Arial, sans-serif",
                  fontSize: "14px",
                  color: "#000000",
                  padding: "8px",
                  textAlign: "right",
                  borderRight: "1px solid #000000",
                }}
              >
                {totalParts.main}
              </div>
              <div
                className="p-2 text-left arial-narrow-font"
                style={{
                  fontFamily: "'Arial Narrow', Arial, sans-serif",
                  fontSize: "14px",
                  color: "#000000",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                .{totalParts.cents}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signatures Section */}
      <div
        className="grid grid-cols-2 gap-4 mt-4"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginTop: "16px",
        }}
      >
        {/* Received By */}
        <div className="space-y-2">
          <div
            className="font-bold souvenir-font"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: "300",
              fontSize: "14px",
              color: "#000000",
            }}
          >
            RECEIVED BY:
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              {/* Signature image */}
              <div
                className="flex justify-center"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "160px",
                  marginLeft: "16px",
                }}
              >
                {formData.signature ? (
                  <img
                    src={formData.signature || "/placeholder.svg"}
                    alt="Signature"
                    style={{
                      maxHeight: "35px",
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
                  >
                    Signature
                  </span>
                )}
              </div>
              {/* Name */}
              <div
                className="flex justify-center"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "160px",
                  marginLeft: "16px",
                }}
              >
                <span
                  className="arial-narrow-font"
                  style={{
                    fontFamily: "'Arial Narrow', Arial, sans-serif",
                    textAlign: "center",
                    display: "block",
                    fontSize: "12px",
                    color: "#000000",
                  }}
                >
                  {formData.printed_name || ""}
                </span>
              </div>

              {/* Static text for "SIGN OVER Printed Name" */}
              <div
                className="font-bold text-center souvenir-font"
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontWeight: "300",
                  borderTop: "1px solid #000000",
                  paddingTop: "8px",
                  width: "80%",
                  margin: "0 auto",
                  fontSize: "12px",
                  color: "#000000",
                  textAlign: "center",
                }}
              >
                Signature Over Printed Name
              </div>
            </div>
          </div>
        </div>

        {/* Approved By */}
        <div className="space-y-2">
          <div
            className="font-bold souvenir-font"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: "300",
              fontSize: "14px",
              color: "#000000",
            }}
          >
            APPROVED BY:
          </div>
          <div className="space-y-1">
            {/* Signature */}
            <div className="flex items-baseline">
              <span
                className="font-medium mr-2 souvenir-font"
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontWeight: "300",
                  fontSize: "12px",
                  color: "#000000",
                  width: "80px",
                }}
              >
                Signature:
              </span>
              <div
                className="flex-1 border-b border-black px-2"
                style={{
                  flex: "1",
                  borderBottom: "1px solid #000000",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  minHeight: "32px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {formData.approved_signature ? (
                  <img
                    src={formData.approved_signature || "/placeholder.svg"}
                    alt="Approved Signature"
                    style={{
                      maxHeight: "35px",
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
                  >
                    Signature
                  </span>
                )}
              </div>
            </div>
            {/* Printed name */}
            <div className="flex items-baseline">
              <span
                className="font-medium mr-2 souvenir-font"
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontWeight: "300",
                  fontSize: "12px",
                  color: "#000000",
                  width: "80px",
                }}
              >
                Printed name:
              </span>
              <div
                className="flex-1 border-b border-black px-2"
                style={{
                  flex: "1",
                  borderBottom: "1px solid #000000",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  minHeight: "24px",
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
                  {formData.approved_name}
                </span>
              </div>
            </div>
            {/* Date */}
            <div className="flex items-baseline">
              <span
                className="font-medium mr-2 souvenir-font"
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontWeight: "300",
                  fontSize: "12px",
                  color: "#000000",
                  width: "80px",
                }}
              >
                Date:
              </span>
              <div
                className="flex-1 border-b border-black px-2"
                style={{
                  flex: "1",
                  borderBottom: "1px solid #000000",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  minHeight: "24px",
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
                  {formatDate(formData.approved_date)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
