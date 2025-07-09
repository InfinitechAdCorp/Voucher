export interface ChequeVoucherFormData {
  account_id?: string
  account_no: string
  paid_to: string
  date: string
  cheque_no: string
  pay_to: string
  cheque_date: string
  amount: string
  signature: string
  printed_name: string
  approved_date: string
}

export interface ChequeVoucher {
  id: number
  user_id?: number
  account_id?: number
  cheque_no: string
  account_no: string
  paid_to: string
  date: string
  pay_to: string
  cheque_date: string
  amount: number
  signature?: string
  printed_name: string
  approved_date: string
  status: string
  created_at: string
  updated_at: string
  user?: {
    id: number
    name: string
    email: string
  }
  account?: {
    id: number
    account_name: string
    account_number: string
  }
}
