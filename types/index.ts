export interface ParticularItem {
  description: string
  amount: string
}

export interface VoucherFormData {
  amount: string
  paid_to: string
  voucher_number: string
  date: string
  particulars: string
  particulars_items?: ParticularItem[]
  signature: string
  printed_name: string
  approved_signature: string
  approved_name: string
  approved_date: string
}
