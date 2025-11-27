import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Averia_Serif_Libre } from "next/font/google"
import "./globals.css"
import { DemoBanner } from "@/components/demo-banner"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const averiaSerifLibre = Averia_Serif_Libre({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-averia-serif"
})

// Updated metadata for GeoBeat
export const metadata: Metadata = {
  title: "GeoBeat - Blockchain Network Analysis",
  description: "Evidence-based analysis of blockchain network health across PDI, JDI, and IHI dimensions",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${averiaSerifLibre.variable}`}>
        <DemoBanner />
        {children}
      </body>
    </html>
  )
}
