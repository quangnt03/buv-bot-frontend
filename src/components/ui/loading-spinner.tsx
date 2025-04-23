import { Loader2 } from "lucide-react"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex justify-center items-center w-full">
      <Loader2 className={`h-6 w-6 animate-spin text-primary ${className}`} />
    </div>
  )
}
