import Link from "next/link"
import Image from "next/image"
import { Search, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b-2 border-foreground bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/images/black-hole copy.png"
                alt="GEOBEAT"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="font-semibold text-base" style={{ fontFamily: "var(--font-averia-serif)" }}>GEOBEAT</span>
            </Link>
            <nav className="hidden md:flex items-center gap-7">
              <Link href="/" className="text-[13px] font-normal hover:text-foreground/80 transition-colors">
                Dashboard
              </Link>
              <Link
                href="/methodology"
                className="text-[13px] font-normal text-muted-foreground hover:text-foreground/80 transition-colors"
              >
                Methodology
              </Link>
              <Link
                href="/about"
                className="text-[13px] font-normal text-muted-foreground hover:text-foreground/80 transition-colors"
              >
                About
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search networks..."
                className="pl-9 w-[220px] h-8 bg-white border-2 border-foreground rounded-sm text-[13px]"
              />
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
