import Link from "next/link"
import Image from "next/image"

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
                width={60}
                height={60}
                className="w-15 h-15"
              />
              <span className="font-semibold text-lg" style={{ fontFamily: "var(--font-averia-serif)" }}>GEOBEAT</span>
            </Link>
            <nav className="hidden md:flex items-center gap-7">
              <Link href="/" className="text-[13px] font-normal hover:text-foreground/80 transition-colors">
                Dashboard
              </Link>
              <Link
                href="https://github.com/DecentralizedGeo/geobeat/blob/main/docs/docs/methodology.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-normal text-muted-foreground hover:text-foreground/80 transition-colors"
              >
                Methodology
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="https://t.me/+PeM33inLfaM2OThk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground rounded-sm text-[13px] font-medium transition-colors"
            >
              Connect
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
