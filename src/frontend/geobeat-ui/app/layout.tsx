import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Averia_Serif_Libre } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const averiaSerifLibre = Averia_Serif_Libre({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-averia-serif"
})

// Updated metadata for GEOBEAT
export const metadata: Metadata = {
  title: "GEOBEAT - Measuring Network Geography",
  description: "Evidence-based analysis of blockchain network health across PDI, JDI, and IHI dimensions",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-touch-icon.png",
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
        {children}
        <Analytics />
      </body>
    </html>
  )
}
