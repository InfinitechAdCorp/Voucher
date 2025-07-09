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
        fontSize: "12px",
        lineHeight: "1.2",
        padding: "20px",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* Logo and Title Row */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <img
            src="/abiclogo.png"
            alt="ABIC Logo"
            className="w-16 h-16 object-contain mr-4"
            crossOrigin="anonymous"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"
            }}
          />
        </div>
        <div className="flex-1 text-center">
          <h1
            className="font-normal border-b-2 border-black pb-1 inline-block"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: "normal",
              fontSize: "18px",
              color: "#000000",
              borderBottom: "2px solid #000000",
              paddingBottom: "2px",
              display: "inline-block",
            }}
          >
            CASH VOUCHER
          </h1>
        </div>
        <div className="w-16"></div>
      </div>

      {/* Amount and Voucher Info Row */}
      <div className="flex justify-between items-center mb-4">
        {/* <div className="flex items-baseline">
          <span
            className="mr-2"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: "normal",
              fontSize: "14px",
              color: "#000000",
            }}
          >
            Amount:
          </span>
          <span
            className="border-b border-black px-2"
            style={{
              fontFamily: "Arial, sans-serif",
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
        </div> */}
        <div className="flex items-baseline">
          <span
            className="mr-2"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: "normal",
              fontSize: "14px",
              color: "#000000",
            }}
          >
            Voucher No:
          </span>
          <span
            className="border-b border-black px-2"
            style={{
              fontFamily: "Arial, sans-serif",
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
            {formData.voucher_number || ""}
          </span>
        </div>
      </div>

      {/* Paid To and Date Row */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-baseline">
          <span
            className="mr-2"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: "normal",
              fontSize: "14px",
              color: "#000000",
            }}
          >
            Paid to:
          </span>
          <span
            className="border-b border-black px-2"
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              color: "#000000",
              borderBottom: "1px solid #000000",
              paddingLeft: "8px",
              paddingRight: "8px",
              minHeight: "20px",
              width: "250px",
              display: "inline-block",
            }}
          >
            {formData.paid_to}
          </span>
        </div>
        <div className="flex items-baseline">
          <span
            className="mr-2"
            style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: "normal",
              fontSize: "14px",
              color: "#000000",
            }}
          >
            Date:
          </span>
          <span
            className="border-b border-black px-2"
            style={{
              fontFamily: "Arial, sans-serif",
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

      {/* Particulars Table */}
      <div
        className="border-2 border-black mb-6"
        style={{
          border: "2px solid #000000",
          marginBottom: "24px",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #000000",
          }}
        >
          <div
            style={{
              flex: "3",
              fontFamily: "'Times New Roman', serif",
              fontWeight: "normal",
              letterSpacing: "2px",
              fontSize: "14px",
              color: "#000000",
              padding: "12px",
              textAlign: "center",
              borderRight: "1px solid #000000",
              minHeight: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            PARTICULARS
          </div>
          <div
            style={{
              flex: "1",
              fontFamily: "'Times New Roman', serif",
              fontWeight: "normal",
              fontSize: "14px",
              color: "#000000",
              padding: "12px",
              textAlign: "center",
              minHeight: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            Amount
          </div>
        </div>

        {/* Particulars Content */}
        <div style={{ minHeight: "120px", display: "flex" }}>
          <div
            style={{
              flex: "3",
              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              color: "#000000",
              padding: "12px",
              borderRight: "1px solid #000000",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            {formData.particulars_items && formData.particulars_items.length > 0
              ? formData.particulars_items.map((item, index) => (
                  <div key={index} style={{ marginBottom: "8px" }}>
                    {item.description}
                  </div>
                ))
              : formData.particulars || ""}
          </div>
          <div
            style={{
              flex: "1",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              position: "relative",
            }}
          >
            {/* Add vertical line in content area */}
            <div
              style={{
                position: "absolute",
                right: "30px",
                top: "0",
                bottom: "0",
                width: "2px",
                backgroundColor: "#000000",
              }}
            />
            {formData.particulars_items && formData.particulars_items.length > 0 ? (
              formData.particulars_items.map((item, index) => {
                const itemAmount = formatAmount(item.amount || "0")
                return (
                  <div key={index} style={{ marginBottom: "8px", display: "flex" }}>
                    <span
                      style={{
                        flex: "1",
                        textAlign: "right",
                        fontFamily: "Arial, sans-serif",
                        fontSize: "12px",
                        color: "#000000",
                        paddingRight: "8px",
                      }}
                    >
                      {item.amount ? `₱${itemAmount.main}` : ""}
                    </span>
                    <span
                      style={{
                        width: "30px",
                        textAlign: "left",
                        fontFamily: "Arial, sans-serif",
                        fontSize: "12px",
                        color: "#000000",
                        paddingLeft: "8px",
                      }}
                    >
                      {item.amount ? `.${itemAmount.cents}` : ""}
                    </span>
                  </div>
                )
              })
            ) : (
              <div style={{ display: "flex", height: "100%", alignItems: "flex-start" }}>
                <span
                  style={{
                    flex: "1",
                    textAlign: "left",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "12px",
                    color: "#000000",
                    paddingRight: "8px",
                  }}
                >
                  {formData.amount ? `${formatAmount(formData.amount).main}` : ""}
                </span>
                <span
                  style={{
                    width: "30px",
                    textAlign: "left",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "12px",
                    color: "#000000",
                    paddingLeft: "12px",
                  }}
                >
                  {formData.amount ? `.${formatAmount(formData.amount).cents}` : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Total Row */}
        <div
          style={{
            display: "flex",
            borderTop: "1px solid #000000",
          }}
        >
          <div
            style={{
              flex: "3",
              fontFamily: "'Times New Roman', serif",
              fontWeight: "normal",
              fontSize: "14px",
              color: "#000000",
              padding: "12px",
              textAlign: "right",
              borderRight: "1px solid #000000",
            }}
          >
            TOTAL ₱
            
          </div>
          <div
            style={{
              flex: "1",
              display: "flex",
              padding: "12px",
              position: "relative",
            }}
          >
            {/* Add vertical line in total row */}
            <div
              style={{
                position: "absolute",
                right: "30px",
                top: "0",
                bottom: "0",
                width: "2px",
                backgroundColor: "#000000",
              }}
            />
            <span
              style={{
                flex: "1",
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#000000",
                textAlign: "left",
                paddingRight: "8px",
              }}
            >
              {totalParts.main}
            </span>
            <span
              style={{
                width: "30px",
                fontFamily: "Arial, sans-serif",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#000000",
                textAlign: "left",
                paddingLeft: "12px",
              }}
            >
              .{totalParts.cents}
            </span>
          </div>
        </div>
      </div>

      {/* Signatures Section */}
      <div className="flex justify-between">
        {/* Received By */}
        <div style={{ width: "45%" }}>
          <div
            style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: "normal",
              fontSize: "14px",
              color: "#000000",
              marginBottom: "16px",
            }}
          >
            RECEIVED BY:
          </div>

          <div
            className="border-b border-black mb-2"
            style={{
              borderBottom: "1px solid #000000",
              padding: "4px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "8px",
            }}
          >
            {formData.signature ? (
              <img
                src={formData.signature || "/placeholder.svg"}
                alt="Signature"
                style={{
                  maxHeight: "45px",
                  maxWidth: "200px",
                  objectFit: "contain",
                }}
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                }}
              />
            ) : (
              <span
                style={{
                  color: "#666666",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "10px",
                }}
              >
                Signature will appear here
              </span>
            )}
          </div>

          <div
            style={{
              textAlign: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                color: "#000000",
              }}
            >
              {formData.printed_name || ""}
            </span>
          </div>

          <div
            style={{
              textAlign: "center",
              fontFamily: "'Times New Roman', serif",
              fontWeight: "normal",
              fontSize: "10px",
              color: "#000000",
            }}
          >
            PRINTED NAME
          </div>
        </div>

        {/* Approved By */}
        <div style={{ width: "45%" }}>
          <div
            style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: "normal",
              fontSize: "14px",
              color: "#000000",
              marginBottom: "16px",
            }}
          >
            APPROVED BY:
          </div>

          <div style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "'Times New Roman', serif",
                fontWeight: "normal",
                fontSize: "12px",
                color: "#000000",
                width: "70px",
              }}
            >
              SIGNATURE:
            </span>
            <div
              style={{
                flex: "1",
                borderBottom: "1px solid #000000",
                padding: "4px",
                height: "35px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {formData.approved_signature ? (
                <img
                  src={formData.approved_signature || "/placeholder.svg"}
                  alt="Approved Signature"
                  style={{
                    maxHeight: "30px",
                    maxWidth: "150px",
                    objectFit: "contain",
                  }}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
              ) : (
                <span
                  style={{
                    color: "#666666",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "10px",
                  }}
                >
                  Signature will appear here
                </span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "'Times New Roman', serif",
                fontWeight: "normal",
                fontSize: "12px",
                color: "#000000",
                width: "70px",
              }}
            >
              Printed name:
            </span>
            <div
              style={{
                flex: "1",
                borderBottom: "1px solid #000000",
                padding: "4px",
                height: "22px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  color: "#000000",
                }}
              >
                {formData.approved_name || ""}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "'Times New Roman', serif",
                fontWeight: "normal",
                fontSize: "12px",
                color: "#000000",
                width: "70px",
              }}
            >
              Date:
            </span>
            <div
              style={{
                flex: "1",
                borderBottom: "1px solid #000000",
                padding: "4px",
                height: "22px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "Arial, sans-serif",
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
  )
}
