import ABICLoader from "@/components/abic-loader"

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <ABICLoader size="lg" text="Loading cash voucher page..." className="animate-fade-in" />
    </div>
  )
}
