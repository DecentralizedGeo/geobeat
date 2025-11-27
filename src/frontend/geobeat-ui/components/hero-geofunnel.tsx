"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

// Grid configuration
const GRID_WIDTH = 1.2 // logical x range: [-W, +W]
const GRID_Y_MAX = 1.4 // logical y range: [0, Ymax]
const VERTICAL_LINES = 18
const HORIZONTAL_LINES = 12
const POINTS_PER_LINE = 64

// Well configuration
const WELL_CENTER_X = 0
const WELL_CENTER_Y = 0.6
const WELL_DEPTH_MAX = 2.5

// Projection parameters
const TILT_X = 0.5
const TILT_Y = 2.2
const FORESHORTEN = 0.6

type Point2D = [number, number]
type Line = Point2D[]

interface GridData {
  verticalLines: Line[]
  horizontalLines: Line[]
}

export function HeroGeofunnel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  const currentTRef = useRef(0)
  const targetTRef = useRef(0)

  const [gridData, setGridData] = useState<GridData | null>(null)
  const [canvasTranslateY, setCanvasTranslateY] = useState(0)

  // Build logical grid
  useEffect(() => {
    const verticalLines: Line[] = []
    const horizontalLines: Line[] = []

    // Vertical lines (constant x, varying y)
    for (let i = 0; i < VERTICAL_LINES; i++) {
      const x = -GRID_WIDTH + (2 * GRID_WIDTH * i) / (VERTICAL_LINES - 1)
      const line: Line = []
      for (let j = 0; j < POINTS_PER_LINE; j++) {
        const y = (GRID_Y_MAX * j) / (POINTS_PER_LINE - 1)
        line.push([x, y])
      }
      verticalLines.push(line)
    }

    // Horizontal lines (constant y, varying x)
    for (let i = 0; i < HORIZONTAL_LINES; i++) {
      const y = (GRID_Y_MAX * i) / (HORIZONTAL_LINES - 1)
      const line: Line = []
      for (let j = 0; j < POINTS_PER_LINE; j++) {
        const x = -GRID_WIDTH + (2 * GRID_WIDTH * j) / (POINTS_PER_LINE - 1)
        line.push([x, y])
      }
      horizontalLines.push(line)
    }

    setGridData({ verticalLines, horizontalLines })
  }, [])

  // Depth function - smooth Gaussian falloff for realistic spacetime curvature
  const depthAt = (x: number, y: number, t: number): number => {
    const dx = x - WELL_CENTER_X
    const dy = y - WELL_CENTER_Y
    const r = Math.sqrt(dx * dx + dy * dy)

    // Gaussian falloff - no hard boundaries, smooth everywhere
    // Sigma controls the "width" of the gravitational well
    const sigma = 0.5
    const gaussian = Math.exp(-(r * r) / (2 * sigma * sigma))

    // Time-based depth scaling for scroll animation
    let depthScale: number
    if (t < 0.33) {
      depthScale = WELL_DEPTH_MAX * (t / 0.33) * 0.4
    } else if (t < 0.66) {
      depthScale = WELL_DEPTH_MAX * (0.4 + 0.4 * ((t - 0.33) / 0.33))
    } else {
      depthScale = WELL_DEPTH_MAX * (0.8 + 0.2 * ((t - 0.66) / 0.34))
    }

    return -depthScale * gaussian
  }

  // Projection function
  const project = (
    x: number,
    y: number,
    z: number,
    width: number,
    height: number
  ): [number, number] => {
    const scale = Math.min(width, height) * 0.7
    const screenCx = width * 0.45
    const screenCy = height * 0.45

    const X0 = screenCx + x * scale
    const Y0 = screenCy + (y - 0.5) * scale

    const depthFactor = 1 / (1 + FORESHORTEN * -z)

    const X = X0 + TILT_X * z * scale
    const Y = Y0 - TILT_Y * z * scale  // Reversed sign to pull down

    const screenX = screenCx + (X - screenCx) * depthFactor
    const screenY = screenCy + (Y - screenCy) * depthFactor

    return [screenX, screenY]
  }

  // Draw function
  const draw = (t: number) => {
    const canvas = canvasRef.current
    if (!canvas || !gridData) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    const dpr = window.devicePixelRatio || 1

    // Clear canvas (no background fill so grid remains visible)
    ctx.clearRect(0, 0, width, height)

    // Use viewport height for scale, not canvas height
    const viewportHeight = window.innerHeight
    const scale = Math.min(width / dpr, viewportHeight) * 0.7

    // Throat visualization removed - grid warping is the main effect

    // Draw grid lines - theme-aware color with fast fade-in
    const isDark = document.body.classList.contains("dark")
    const baseOpacity = isDark ? 0.7 : 0.9
    // Faster fade-in: starts at 15%, reaches full opacity much sooner
    const opacity = baseOpacity * Math.min(1, 0.15 + 1.7 * t)
    ctx.strokeStyle = isDark ? `rgba(160, 170, 190, ${opacity})` : `rgba(120, 130, 150, ${opacity})`
    ctx.lineWidth = 1 * dpr

    const drawLine = (line: Line) => {
      ctx.beginPath()
      let first = true
      for (const [x, y] of line) {
        const z = depthAt(x, y, t)
        const [screenX, screenY] = project(x, y, z, width / dpr, viewportHeight)
        if (first) {
          ctx.moveTo(screenX * dpr, screenY * dpr)
          first = false
        } else {
          ctx.lineTo(screenX * dpr, screenY * dpr)
        }
      }
      ctx.stroke()
    }

    gridData.verticalLines.forEach(drawLine)
    gridData.horizontalLines.forEach(drawLine)
  }

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight

      // Map section position to t ∈ [0, 1]
      // When section top is at viewport top (rect.top = 0), t should be 0
      // As user scrolls down and section moves up (rect.top becomes negative), t increases
      let t = Math.max(0, -rect.top / (vh * 1.2))
      t = Math.min(1, t)

      targetTRef.current = t

      // Calculate canvas upward movement throughout entire scroll
      // Move up more aggressively (1.5x viewport height) to show center/bottom parts sooner
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress = window.scrollY / Math.max(1, maxScroll)
      const translateY = -scrollProgress * vh * 1.5
      setCanvasTranslateY(translateY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      currentTRef.current += (targetTRef.current - currentTRef.current) * 0.085
      draw(currentTRef.current)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gridData])

  // Resize observer for fixed canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      // Make canvas 3x viewport height to give room for funnel to extend
      const height = window.innerHeight * 3

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(1, 1) // Reset transform
      }
    }

    window.addEventListener('resize', resize)
    resize() // Initial sizing

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      {/* Fixed canvas background that extends across entire page */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{
          pointerEvents: "none",
          zIndex: 0,
          transform: `translateY(${canvasTranslateY}px)`,
          transition: "transform 0.1s ease-out"
        }}
      />

      <section
        ref={sectionRef}
        className="relative w-full flex items-start justify-start px-6 md:px-12 pt-32"
        style={{ height: "150vh" }}
      >

      {/* Text overlay */}
      <div className="relative z-10 max-w-2xl">
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.15] mb-6 text-foreground">
          Most "decentralized" networks aren't{" "}
          <span className="font-bold">geographically decentralized.</span>
        </h1>
        <p className="text-xlg md:text-xl text-foreground/75 leading-relaxed mb-8 max-w-xl">
          <span className="font-semibold">GEOBEAT</span> is a real-time geographic observatory<br /> for decentralized networks.
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="rounded-sm group bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground text-lg px-8 py-6 h-auto">
            Explore the Index
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
      </section>
    </>
  )
}
