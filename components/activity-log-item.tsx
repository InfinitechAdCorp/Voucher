import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, X, CheckCircle, Banknote, FileText, Clock } from "lucide-react"

interface ActivityLogItemProps {
  activity: {
    id: number
    action: "created" | "updated" | "deleted" | "cancelled" | "approved" | "paid"
    entity_type: "cash_voucher" | "cheque_voucher" | "account" | "user"
    entity_id: number
    entity_name: string
    description: string
    user_name?: string
    created_at: string
    metadata?: {
      amount?: number
      old_values?: any
      new_values?: any
    }
  }
}

export default function ActivityLogItem({ activity }: ActivityLogItemProps) {
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "created":
        return <PlusCircle className="h-4 w-4 text-green-500" />
      case "updated":
        return <Edit className="h-4 w-4 text-blue-500" />
      case "deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "cancelled":
        return <X className="h-4 w-4 text-orange-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "paid":
        return <Banknote className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadge = (action: string) => {
    const variants = {
      created: "bg-green-100 text-green-800",
      updated: "bg-blue-100 text-blue-800",
      deleted: "bg-red-100 text-red-800",
      cancelled: "bg-orange-100 text-orange-800",
      approved: "bg-green-100 text-green-800",
      paid: "bg-purple-100 text-purple-800",
    } as const

    return (
      <Badge className={variants[action as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    )
  }

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case "cash_voucher":
        return "Cash Voucher"
      case "cheque_voucher":
        return "Cheque Voucher"
      case "account":
        return "Account"
      case "user":
        return "User"
      default:
        return entityType
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex items-start space-x-3 p-4 border-b border-gray-200 last:border-b-0">
      <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.action)}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center space-x-2 mb-1">
          {getActivityBadge(activity.action)}
          <span className="text-sm text-gray-500">{getEntityTypeLabel(activity.entity_type)}</span>
        </div>
        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
          <span>Entity: {activity.entity_name}</span>
          {activity.metadata?.amount && <span>Amount: {formatAmount(activity.metadata.amount)}</span>}
          {activity.user_name && <span>By: {activity.user_name}</span>}
        </div>
        <div className="mt-1 text-xs text-gray-400">
          <Clock className="inline h-3 w-3 mr-1" />
          {formatDateTime(activity.created_at)}
        </div>
      </div>
    </div>
  )
}
