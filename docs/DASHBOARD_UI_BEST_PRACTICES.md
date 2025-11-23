# Dashboard UI Best Practices Guide

## Overview

Comprehensive best practices for building modern dashboard UIs with Next.js 16, React, Tailwind CSS 4, TypeScript, and Radix UI. This guide covers tooltips, statistics cards, typography, accordions, and data visualization components.

**Technology Stack:**
- Next.js 16.0.3
- React 19.2.0
- Tailwind CSS 4.1.9
- TypeScript 5
- Radix UI Primitives
- Recharts 2.15.4

---

## 1. Tooltip Patterns

### 1.1 Accessible Tooltip Implementation with Radix UI

**Official Recommendation:** Use Radix UI Tooltip for WCAG-compliant, accessible tooltips.

```tsx
// components/ui/tooltip.tsx
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={200} skipDelayDuration={300}>
      {children}
    </TooltipPrimitive.Provider>
  )
}

export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={5}
          className="z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-gray-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
```

**Key Features:**
- **Accessibility:** WAI-ARIA compliant with `aria-describedby` automatically managed
- **Keyboard Support:** Opens on focus, closes on Escape
- **Customizable Delays:** `delayDuration` (initial) and `skipDelayDuration` (between tooltips)
- **Positioning:** Automatic collision detection and side adjustment

### 1.2 Usage Example for Data Labels

```tsx
// Example: Metric badge with tooltip
import { Tooltip } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

function MetricBadge({ label, value, description }: {
  label: string
  value: string | number
  description: string
}) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
      <span className="text-sm font-medium text-blue-900">{label}:</span>
      <span className="text-sm font-semibold text-blue-700">{value}</span>
      <Tooltip content={description}>
        <button className="p-0.5 hover:bg-blue-100 rounded-full transition-colors">
          <InfoIcon className="w-3.5 h-3.5 text-blue-600" />
        </button>
      </Tooltip>
    </div>
  )
}
```

### 1.3 Mobile-Friendly Tooltip Alternatives

**CRITICAL:** Tooltips are not accessible on touch devices. Implement these alternatives:

#### Option 1: Inline Toggle (Recommended for Mobile)

```tsx
"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

function MobileMetricCard({ title, value, description }: {
  title: string
  value: string
  description: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border rounded-lg p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="text-left">
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {isExpanded && (
        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
          {description}
        </div>
      )}
    </div>
  )
}
```

#### Option 2: Persistent Content (Best for Essential Information)

```tsx
// Don't hide essential information behind tooltips
// Show it inline with proper visual hierarchy
function MetricCardWithContext({ title, value, change, context }: {
  title: string
  value: string
  change: string
  context: string
}) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-green-600">{change}</div>
      <div className="mt-2 text-xs text-gray-500">{context}</div>
    </div>
  )
}
```

#### Option 3: Responsive Pattern (Desktop Tooltip, Mobile Toggle)

```tsx
"use client"

import { useState } from "react"
import { Tooltip } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

function ResponsiveMetricBadge({ label, value, description }: {
  label: string
  value: string
  description: string
}) {
  const [showMobile, setShowMobile] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const badge = (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
      <span className="text-sm font-medium text-blue-900">{label}:</span>
      <span className="text-sm font-semibold text-blue-700">{value}</span>
    </div>
  )

  if (isDesktop) {
    return (
      <Tooltip content={description}>
        <div className="inline-flex items-center gap-1">
          {badge}
          <InfoIcon className="w-3.5 h-3.5 text-blue-600" />
        </div>
      </Tooltip>
    )
  }

  return (
    <div>
      <button
        onClick={() => setShowMobile(!showMobile)}
        className="inline-flex items-center gap-1"
      >
        {badge}
        <InfoIcon className="w-3.5 h-3.5 text-blue-600" />
      </button>
      {showMobile && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
          {description}
        </div>
      )}
    </div>
  )
}
```

**Best Practices:**
- Only include non-essential content in tooltips
- Always provide a keyboard-accessible trigger (button or interactive element)
- Never place tooltips on non-interactive elements
- For mobile, use tap-to-toggle or persistent content
- Consider using modals for longer explanations

---

## 2. Dashboard Statistics Cards

### 2.1 KPI Card Layout Patterns

#### Basic KPI Card

```tsx
// components/dashboard/kpi-card.tsx
interface KPICardProps {
  title: string
  value: string | number
  change?: number
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
}

export function KPICard({ title, value, change, trend, icon }: KPICardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  trend === "up"
                    ? "text-green-600"
                    : trend === "down"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {change > 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
```

#### KPI Card with Sparkline

```tsx
import { Sparklines, SparklinesLine } from "react-sparklines"
import { TrendingUp, TrendingDown } from "lucide-react"

interface KPICardWithSparklineProps {
  title: string
  value: string | number
  data: number[]
  change: number
}

export function KPICardWithSparkline({
  title,
  value,
  data,
  change,
}: KPICardWithSparklineProps) {
  const isPositive = change >= 0

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {isPositive ? (
          <TrendingUp className="h-5 w-5 text-green-600" />
        ) : (
          <TrendingDown className="h-5 w-5 text-red-600" />
        )}
      </div>
      <div className="mt-4">
        <div className="h-12">
          <Sparklines data={data} width={200} height={48}>
            <SparklinesLine
              color={isPositive ? "#10b981" : "#ef4444"}
              style={{ strokeWidth: 2, fill: "none" }}
            />
          </Sparklines>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <span
            className={`text-sm font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
          <span className="text-xs text-gray-500">from last month</span>
        </div>
      </div>
    </div>
  )
}
```

#### Using Tremor for Dashboard Cards (Alternative Approach)

```tsx
// Install: npm install @tremor/react
import { Card, Metric, Text, Flex, BadgeDelta } from "@tremor/react"

export function TremorKPICard() {
  return (
    <Card decoration="top" decorationColor="blue">
      <Flex justifyContent="between" alignItems="center">
        <div>
          <Text>Total Revenue</Text>
          <Metric>$45,231.89</Metric>
        </div>
        <BadgeDelta deltaType="increase" size="lg">
          12.3%
        </BadgeDelta>
      </Flex>
    </Card>
  )
}
```

### 2.2 Visual Hierarchy Best Practices

**Typography Scale for Cards:**
- **Card Title:** `text-sm` (14px) with `font-medium` and muted color
- **Primary Value:** `text-3xl` (30px) with `font-bold` and high contrast
- **Secondary Info:** `text-sm` (14px) for percentage changes
- **Supporting Text:** `text-xs` (12px) with `text-gray-500`

**Color Usage:**
- **Positive Trends:** `text-green-600` (#059669)
- **Negative Trends:** `text-red-600` (#dc2626)
- **Neutral:** `text-gray-600` (#4b5563)
- **Card Background:** `bg-white` with `border` and subtle `shadow-sm`

**Spacing:**
- Card padding: `p-6` (24px)
- Between elements: `mt-2` (8px) or `mt-4` (16px)
- Gap in flex layouts: `gap-1.5` or `gap-2`

### 2.3 Grid Layout for Dashboard Cards

```tsx
export function DashboardGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Networks"
        value="145"
        change={12.5}
        trend="up"
      />
      <KPICard
        title="Active Devices"
        value="2,350"
        change={-3.2}
        trend="down"
      />
      <KPICard
        title="Avg Response Time"
        value="234ms"
        change={5.1}
        trend="up"
      />
      <KPICard
        title="Success Rate"
        value="99.2%"
        change={0.3}
        trend="up"
      />
    </div>
  )
}
```

---

## 3. Typography Hierarchy for Dashboards

### 3.1 Font Selection

**Recommended Sans-Serif Fonts for Dashboards:**

1. **Inter** (Recommended - Industry Standard)
   - Optimized for screen readability
   - Excellent at small sizes
   - Used by: Figma, Notion, GitHub, NASA
   - Variable font with multiple weights

2. **Geist Sans** (Modern Alternative)
   - Designed by Vercel for developers
   - Based on Swiss typography principles
   - Influenced by Inter and SF Pro
   - Excellent clarity and precision

3. **System Fonts** (Fallback)
   - Fast loading
   - Familiar to users
   - Good cross-platform support

```css
/* tailwind.config.ts - Font configuration */
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
}
```

**Installing Inter:**

```bash
# Using next/font (recommended for Next.js)
# app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

**Installing Geist:**

```bash
npm install geist
```

```tsx
// app/layout.tsx
import { GeistSans } from 'geist/font/sans'

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### 3.2 Typography Scale for Data-Heavy Interfaces

```tsx
// Tailwind CSS configuration with custom scale
export default {
  theme: {
    extend: {
      fontSize: {
        // Metric displays
        'metric-lg': ['3rem', { lineHeight: '1', fontWeight: '700' }], // 48px
        'metric': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],   // 32px
        'metric-sm': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }], // 24px

        // Labels and descriptions
        'label': ['0.875rem', { lineHeight: '1.5', fontWeight: '500' }], // 14px
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }], // 12px
      },
    },
  },
}
```

**Usage Example:**

```tsx
function MetricDisplay() {
  return (
    <div>
      <div className="text-label text-gray-600">Network Density</div>
      <div className="text-metric text-gray-900">0.847</div>
      <div className="text-caption text-gray-500">
        Connections per node
      </div>
    </div>
  )
}
```

### 3.3 Font Weights

```tsx
// Recommended weight hierarchy
const weights = {
  // Headers and primary metrics
  bold: 700,      // font-bold
  semibold: 600,  // font-semibold

  // Labels and secondary text
  medium: 500,    // font-medium

  // Body and supporting text
  normal: 400,    // font-normal
}
```

### 3.4 Color Contrast for Accessibility

**WCAG 2.1 AA Requirements:**
- Normal text (< 18px): **4.5:1** minimum contrast ratio
- Large text (≥ 18px): **3:1** minimum contrast ratio
- UI components: **3:1** minimum contrast ratio

**Recommended Color Palette:**

```tsx
// Tailwind color usage for data dashboards
const colors = {
  // Primary text - Maximum readability
  primary: 'text-gray-900',      // #111827 - Contrast ratio: 16.91:1

  // Secondary text - Labels, metadata
  secondary: 'text-gray-600',    // #4b5563 - Contrast ratio: 7.55:1

  // Tertiary text - Supporting info
  tertiary: 'text-gray-500',     // #6b7280 - Contrast ratio: 5.87:1

  // Interactive elements
  interactive: 'text-blue-600',  // #2563eb - Contrast ratio: 6.11:1

  // Status indicators
  success: 'text-green-600',     // #059669 - Contrast ratio: 4.87:1
  danger: 'text-red-600',        // #dc2626 - Contrast ratio: 5.94:1
  warning: 'text-amber-600',     // #d97706 - Contrast ratio: 5.34:1
}
```

**Testing Contrast Ratios:**
- Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Built-in browser DevTools accessibility panel
- [Chrome Color Contrast Analyzer](https://www.accessibilitychecker.org/color-contrast-checker/)

### 3.5 Line Height and Letter Spacing

```css
/* Optimized for dashboard readability */
.dashboard-text {
  /* Body text */
  --body-line-height: 1.5;

  /* Metric displays - tighter for visual impact */
  --metric-line-height: 1.0;

  /* Labels - comfortable readability */
  --label-line-height: 1.5;

  /* Letter spacing for all-caps labels */
  --caps-letter-spacing: 0.05em;
}
```

```tsx
function MetricLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-medium uppercase tracking-wider text-gray-600">
      {children}
    </div>
  )
}
```

---

## 4. Accordion/Expansion Panels

### 4.1 Radix UI Accordion Implementation

```tsx
// components/ui/accordion.tsx
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

export function Accordion({
  items,
  type = "single",
  collapsible = true,
}: {
  items: Array<{ title: string; content: React.ReactNode; value: string }>
  type?: "single" | "multiple"
  collapsible?: boolean
}) {
  return (
    <AccordionPrimitive.Root
      type={type}
      collapsible={collapsible}
      className="w-full divide-y divide-gray-200 rounded-lg border"
    >
      {items.map((item) => (
        <AccordionPrimitive.Item key={item.value} value={item.value}>
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between px-6 py-4 text-left font-medium transition-all hover:bg-gray-50">
              {item.title}
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="px-6 py-4">{item.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  )
}
```

### 4.2 Animated Accordion with Tailwind CSS

Add animations to `tailwind.config.ts`:

```tsx
export default {
  theme: {
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
}
```

### 4.3 Number Display and Formatting in Accordions

```tsx
// utils/format.ts
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toLocaleString()
}

export function formatPercentage(num: number, decimals = 1): string {
  return `${num.toFixed(decimals)}%`
}

export function formatMetric(num: number, decimals = 2): string {
  return num.toFixed(decimals)
}
```

**Usage in Accordion:**

```tsx
import { formatNumber, formatPercentage, formatMetric } from "@/utils/format"

interface NetworkMetrics {
  nodes: number
  edges: number
  density: number
  avgDegree: number
  clustering: number
}

function NetworkAccordion({ networks }: { networks: Array<{ id: string; name: string; metrics: NetworkMetrics }> }) {
  return (
    <Accordion
      items={networks.map((network) => ({
        value: network.id,
        title: (
          <div className="flex items-center justify-between w-full pr-4">
            <span className="font-semibold text-gray-900">{network.name}</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {formatNumber(network.metrics.nodes)} nodes
              </span>
              <span className="text-sm text-gray-600">
                {formatNumber(network.metrics.edges)} edges
              </span>
            </div>
          </div>
        ),
        content: (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricItem
              label="Density"
              value={formatMetric(network.metrics.density, 3)}
            />
            <MetricItem
              label="Avg Degree"
              value={formatMetric(network.metrics.avgDegree, 1)}
            />
            <MetricItem
              label="Clustering"
              value={formatPercentage(network.metrics.clustering * 100)}
            />
            <MetricItem
              label="Total Edges"
              value={formatNumber(network.metrics.edges)}
            />
          </div>
        ),
      }))}
    />
  )
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )
}
```

### 4.4 Progressive Disclosure Best Practices

**Key Principles:**
- Show essential metrics in collapsed state
- Reveal detailed breakdowns on expansion
- Limit to 2 levels of nesting maximum
- Use clear visual hierarchy

```tsx
function ProgressiveDisclosureExample() {
  return (
    <div className="space-y-4">
      {/* Level 1: Overview Card */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Network Performance</h3>
            <p className="text-3xl font-bold mt-2">98.5%</p>
            <p className="text-sm text-gray-600 mt-1">Overall health score</p>
          </div>
          <div className="text-green-600">
            <TrendingUp className="h-8 w-8" />
          </div>
        </div>

        {/* Level 2: Expandable Details */}
        <Accordion
          items={[
            {
              value: "breakdown",
              title: "View Detailed Breakdown",
              content: (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Uptime</p>
                    <p className="text-xl font-bold">99.9%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Latency</p>
                    <p className="text-xl font-bold">23ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Throughput</p>
                    <p className="text-xl font-bold">1.2 GB/s</p>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
```

---

## 5. Charts and Data Visualization

### 5.1 Chart Library Selection

**Recommended for Geographic/Network Data:**

| Library | Best For | Pros | Cons |
|---------|----------|------|------|
| **Recharts** | Standard charts (bar, line, area) | React-native, simple API, composable | Limited customization |
| **D3.js** | Custom network graphs, force layouts | Maximum flexibility, powerful | Steep learning curve |
| **Tremor** | Dashboard quick wins | Pre-styled, consistent design | Less customization |
| **React Force Graph** | Network visualization | Specialized for graphs | Single purpose |

### 5.2 Recharts Examples for Dashboards

#### Simple Line Chart

```tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface DataPoint {
  date: string
  value: number
}

export function SimpleLineChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            fontSize: "12px",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

#### Area Chart with Gradient

```tsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function GradientAreaChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

#### Mini Bar Chart for Cards

```tsx
import { BarChart, Bar, ResponsiveContainer } from "recharts"

export function MiniBarChart({ data }: { data: number[] }) {
  const chartData = data.map((value, index) => ({ value, index }))

  return (
    <ResponsiveContainer width="100%" height={60}>
      <BarChart data={chartData}>
        <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

### 5.3 Network Graph with D3 Force Layout

```tsx
"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface Node {
  id: string
  name: string
}

interface Link {
  source: string
  target: string
  value: number
}

interface NetworkGraphProps {
  nodes: Node[]
  links: Link[]
}

export function NetworkGraph({ nodes, links }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        "link",
        d3.forceLink(links).id((d: any) => d.id)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))

    // Create links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", (d) => Math.sqrt(d.value))
      .attr("stroke-opacity", 0.6)

    // Create nodes
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", "#2563eb")
      .call(drag(simulation) as any)

    // Add labels
    const label = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d) => d.name)
      .attr("font-size", 10)
      .attr("dx", 12)
      .attr("dy", 4)

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y)

      label.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y)
    })

    // Drag behavior
    function drag(simulation: d3.Simulation<any, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      }

      function dragged(event: any) {
        event.subject.fx = event.x
        event.subject.fy = event.y
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    }

    return () => {
      simulation.stop()
    }
  }, [nodes, links])

  return <svg ref={svgRef} className="w-full h-full" />
}
```

### 5.4 Minimalist Chart Aesthetics

**Design Principles:**
- Remove unnecessary grid lines
- Use subtle colors for non-data elements
- Emphasize data with higher contrast
- Minimal axis styling
- Clean tooltips

```tsx
// Recharts theme configuration
const chartTheme = {
  grid: {
    stroke: "#e5e7eb",
    strokeDasharray: "3 3",
  },
  axis: {
    stroke: "#6b7280",
    fontSize: 12,
    tickLine: false,
  },
  tooltip: {
    contentStyle: {
      backgroundColor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "6px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      fontSize: "12px",
    },
  },
  colors: {
    primary: "#2563eb",
    secondary: "#7c3aed",
    success: "#059669",
    danger: "#dc2626",
  },
}
```

### 5.5 Responsive Chart Container

```tsx
export function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      <div className="w-full">{children}</div>
    </div>
  )
}
```

---

## 6. Component Library Recommendations

### 6.1 Essential Libraries for Your Stack

```bash
# Already installed in your project
@radix-ui/react-accordion
@radix-ui/react-tooltip
@radix-ui/react-collapsible
recharts
lucide-react
tailwindcss-animate

# Recommended additions
npm install @tremor/react          # Optional: Pre-built dashboard components
npm install react-sparklines       # For sparklines in KPI cards
npm install d3-force d3-scale      # For network graphs (already have d3-*)
npm install numeral               # For advanced number formatting
```

### 6.2 Utility Hooks

```tsx
// hooks/use-media-query.ts
import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}
```

---

## 7. Real-World Examples and Inspiration

### 7.1 Well-Designed Dashboard References

1. **Vercel Analytics Dashboard**
   - Clean KPI cards with sparklines
   - Minimalist chart design
   - Excellent mobile responsiveness

2. **Linear App**
   - Subtle animations and transitions
   - Clear visual hierarchy
   - Progressive disclosure patterns

3. **Stripe Dashboard**
   - Data-dense but readable
   - Excellent number formatting
   - Clear status indicators

4. **shadcn/ui Dashboard Example**
   - Source: https://ui.shadcn.com/examples/dashboard
   - Shows Total Revenue, Visitors, KPIs
   - Clean implementation with Recharts

### 7.2 Open Source Templates

- **Next.js Shadcn Dashboard Starter**: https://github.com/Kiranism/next-shadcn-dashboard-starter
- **Vercel Admin Dashboard**: https://vercel.com/templates/next.js/next-js-and-shadcn-ui-admin-dashboard
- **Tremor Dashboard Examples**: https://www.tremor.so/

---

## 8. Quick Reference Checklist

### Accessibility
- [ ] Tooltips have keyboard support
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text)
- [ ] Mobile alternatives for hover-only interactions
- [ ] Proper ARIA labels and semantic HTML
- [ ] Focus indicators on interactive elements

### Typography
- [ ] Consistent font family (Inter or Geist recommended)
- [ ] Clear hierarchy with 3-4 text sizes maximum
- [ ] Sufficient line height (1.5 for body text)
- [ ] Proper font weights (400-700 range)
- [ ] All-caps labels use letter-spacing

### Statistics Cards
- [ ] Clear visual hierarchy (title → value → change)
- [ ] Consistent spacing and padding
- [ ] Trend indicators with color coding
- [ ] Proper number formatting and abbreviations
- [ ] Responsive grid layout

### Data Visualization
- [ ] Minimal non-data ink
- [ ] Clear axis labels and legends
- [ ] Accessible color palette
- [ ] Responsive container sizing
- [ ] Loading states for async data

### Progressive Disclosure
- [ ] Essential info always visible
- [ ] Maximum 2 levels of nesting
- [ ] Animated transitions for smoothness
- [ ] Clear expand/collapse indicators
- [ ] Keyboard accessible

---

## 9. Code Snippets Library

### Number Formatting Utilities

```tsx
// utils/format.ts
export const formatters = {
  // Format large numbers with K/M/B suffix
  compact: (num: number): string => {
    const formatter = new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    })
    return formatter.format(num)
  },

  // Format currency
  currency: (num: number, currency = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num)
  },

  // Format percentage
  percentage: (num: number, decimals = 1): string => {
    return `${num.toFixed(decimals)}%`
  },

  // Format with custom decimals
  decimal: (num: number, decimals = 2): string => {
    return num.toFixed(decimals)
  },

  // Format with locale-specific separators
  localized: (num: number): string => {
    return num.toLocaleString("en-US")
  },
}
```

### Color Palette

```tsx
// constants/colors.ts
export const dashboardColors = {
  // Text colors
  text: {
    primary: "text-gray-900",
    secondary: "text-gray-600",
    tertiary: "text-gray-500",
    inverse: "text-white",
  },

  // Background colors
  bg: {
    primary: "bg-white",
    secondary: "bg-gray-50",
    tertiary: "bg-gray-100",
  },

  // Status colors
  status: {
    success: "text-green-600",
    warning: "text-amber-600",
    danger: "text-red-600",
    info: "text-blue-600",
  },

  // Chart colors
  charts: {
    primary: "#2563eb",    // blue-600
    secondary: "#7c3aed",  // violet-600
    tertiary: "#059669",   // green-600
    quaternary: "#dc2626", // red-600
  },
}
```

---

## Sources

### Official Documentation
- [Radix UI Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)
- [Radix UI Accordion](https://www.radix-ui.com/primitives/docs/components/accordion)
- [Tailwind CSS Stats Components](https://tailwindui.com/components/application-ui/data-display/stats)
- [Recharts Documentation](https://recharts.org/)
- [D3 Force Layout](https://d3js.org/d3-force)

### Accessibility Guidelines
- [Nielsen Norman Group Tooltip Guidelines](https://www.nngroup.com/articles/tooltip-guidelines/)
- [GitHub Primer Tooltip Alternatives](https://primer.style/design/accessibility/tooltip-alternatives/)
- [WebAIM Contrast Checker](https://webaim.org/articles/contrast/)
- [WCAG Color Accessibility Guide](https://chromacreator.com/blog/wcag-accessibility-complete-guide)
- [Sarah Higley: Tooltips in WCAG 2.1](https://sarahmhigley.com/writing/tooltips-in-wcag-21/)

### Design Best Practices
- [UXPin Dashboard Design Principles](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- [Datafloq Typography Basics for Dashboards](https://datafloq.com/typography-basics-for-data-dashboards/)
- [Nielsen Norman Group Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [Toptal Dashboard Design Best Practices](https://www.toptal.com/designers/data-visualization/dashboard-design-best-practices)

### Typography
- [Inter Font by Rasmus Andersson](https://en.wikipedia.org/wiki/Inter_(typeface))
- [Geist Font by Vercel](https://vercel.com/font)
- [Untitled UI: Best Free Fonts](https://www.untitledui.com/blog/best-free-fonts)

### Component Libraries
- [Tremor React Dashboard Components](https://www.tremor.so/)
- [shadcn/ui Dashboard Example](https://ui.shadcn.com/examples/dashboard)
- [Material Tailwind KPI Cards](https://www.material-tailwind.com/blocks/kpi-cards)
- [Flowbite Tailwind Badges](https://flowbite.com/docs/components/badge/)

### Data Visualization
- [Ably: Next.js and Recharts Tutorial](https://ably.com/blog/informational-dashboard-with-nextjs-and-recharts)
- [LogRocket: Best React Chart Libraries](https://blog.logrocket.com/best-react-chart-libraries-2025/)
- [React Graph Gallery Network Diagrams](https://www.react-graph-gallery.com/network-chart)
- [react-force-graph Library](https://github.com/vasturiano/react-force-graph)

### Implementation Guides
- [MakerX: Styling Radix UI with Tailwind](https://blog.makerx.com.au/styling-radix-ui-components-using-tailwind-css/)
- [Radix Tailwind CSS Integration](https://tailwindcss-radix.vercel.app)
- [LogRocket: Build React Dashboard with Tremor](https://blog.logrocket.com/build-react-dashboard-tremor/)
- [Smashing Magazine: Mobile Tooltips](https://www.smashingmagazine.com/2021/02/designing-tooltips-mobile-user-interfaces/)
