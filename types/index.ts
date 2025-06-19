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
export interface Account {
  id: number
  account_number: string
  account_name: string
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'owner'
  balance: number
  created_at?: string
  updated_at?: string
}
export interface IconSvgProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  width?: number;
  height?: number;
}
