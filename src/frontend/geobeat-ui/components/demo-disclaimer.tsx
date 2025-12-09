import Link from "next/link"
import { AlertCircle } from "lucide-react"

interface DemoDisclaimerProps {
  variant?: "dashboard" | "landing"
}

export function DemoDisclaimer({ variant = "dashboard" }: DemoDisclaimerProps) {
  const content = {
    dashboard: {
      title: "Data Snapshot:",
      message: "This dashboard displays network data from November 2025.",
    },
    landing: {
      title: "Data Snapshot:",
      message: "Analysis based on network data from November 2025.",
    },
  }

  const { title, message } = content[variant]

  return (
    <div className="border-2 border-amber-500 bg-amber-50 rounded-sm">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="text-amber-900 font-medium">
              <strong>{title}</strong> {message}
              {" "}
              <Link
                href="/docs/DEMO_IMPLEMENTATION.md"
                className="underline hover:text-amber-700"
                target="_blank"
              >
                View methodology
              </Link>
              {" "}
              or{" "}
              <a
                href="https://github.com/DecentralizedGeo/geobeat/issues"
                className="underline hover:text-amber-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                inquire about live data
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
